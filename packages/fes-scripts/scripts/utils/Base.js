const { parse, join } = require('path');
const Koa = require('koa');
const Mock = require('mockjs');
const serve = require('koa-static');
const Router = require('koa-router');
const chalk = require('chalk');
const send = require('koa-send');
const views = require('koa-views');
const proxyMiddleware = require('http-proxy-middleware');
const address = require('address');
const qrcodeTerminal = require('qrcode-terminal');
const c2k = require('koa2-connect');
const paths = require('./paths');
const clearConsole = require('./clearConsole');

const appConfig = require(paths.appConfig); // eslint-disable-line
const appname = require(paths.appPackageJson).name; // eslint-disable-line
const openBrowser = require('./openBrowser');
const choosePort = require('./choosePort');

// const softExit = (msg, code = 1) => {
//   msg && console.error(chalk.bold.red(msg)); // eslint-disable-line
//   process.exit(code);
// };

const isPlainObject = obj => Object(obj) === obj;
// Object(obj) === obj && Object.prototype.toString.call(obj) === '[object Object]';

const mockApi = async (ctx, next) => { // eslint-disable-line
  if (!ctx.path.includes('/static')) {
    // avoid delaying loading static resources
    const mockContext = {
      mock(path) {
        const url = join(paths.appSrc, 'api', path);
        delete require.cache[url];
        return Mock.mock(require(url)); // eslint-disable-line
      },
    };
    delete require.cache[join(paths.appApi, 'index.js')];
    const api = require(paths.appApi); // eslint-disable-line
    const mockData = api.call(mockContext);
    const responseBody = mockData[ctx.url];

    if (responseBody) {
      ctx.body = responseBody;
      if (typeof responseBody === 'function') {
        try {
          const responseBodyFromFun = responseBody.call(mockContext);
          ctx.body = responseBodyFromFun.data;
          if (typeof responseBodyFromFun.others === 'function') {
            responseBodyFromFun.others(ctx);
          }
        } catch (error) {
          console.log(`${chalk.bold.red('Error: ')}`, error);
        }
        console.log(
          `${chalk.black.bgYellow('MOCK-APIs')}   ${chalk.bold.green(ctx.method)}  ${chalk.gray(
            '--->'
          )}  ${chalk.dim(ctx.url)}`
        );
      }
    }
  }
  await next();
};
class Base {
  constructor(mode) {
    this.appConfig = appConfig;
    this.config = appConfig[mode];
    this.app = new Koa();
    this.router = new Router();
    this.router.mapRoutes = [];
    this.views = views;
    this.serve = serve;
    this.clearConsole = clearConsole;
  }

  softExit(msg, code = 1, customMsg) { // eslint-disable-line
    msg && console.error(chalk.bold.red(msg)); // eslint-disable-line
    customMsg();
    process.exit(code);
  }

  run(runCallback) {
    const DEFAULT_PORT = parseInt(process.env.PORT, 10) || this.config.port;
    const HOST = process.env.HOST || '0.0.0.0';
    choosePort(HOST, DEFAULT_PORT)
      .then((p) => {
        if (p == null) {
          return;
        }
        this.port = p;
        this.app.on('error', (err, ctx) => console.error(`\n${chalk.bold.red('Error: ')} ${chalk.red(err)}\n`, ctx, '\n'));
        // this.app.use(mockApi());
        runCallback(paths, chalk);
      })
      .catch((err) => {
        if (err && err.message) {
          console.log(err.message);
        }
        process.exit(1);
      });
  }

  createRouter(routerConfig, root, isIndex) {
    /**
     * normalize string path
     * @param {String} middleware
     * @return {String} middleware
     */
    const normolMiddleware = (middleware) => {
      const metas = parse(middleware);
      if (metas.root === '') {
        middleware = `/${middleware}`; // eslint-disable-line
      }
      if (metas.ext === '') {
        middleware = `${middleware}.html`; // eslint-disable-line
      }
      return middleware;
    };

    /**
     * validate router config
     * @param {Object} routerConfig
     * @return {Object} newRouterConfig
     */
    const validateRouterConfig = (routerConfig, root) => { // eslint-disable-line
      if (!isPlainObject(routerConfig)) {
        this.softExit('\nTypeError: routerConfig expected is a Object.');
      }
      let newRouterConfig = routerConfig;
      if (!Array.isArray(newRouterConfig)) {
        newRouterConfig = Object.keys(routerConfig).map((key) => {
          this.router.mapRoutes.push(key); // eslint-disable-line
          // 对 key 处理： a/b => /a/b
          return {
            path: key,
            method: 'get',
            middleware: routerConfig[key],
          };
        });
      }
      newRouterConfig = newRouterConfig.map((route) => {
        const { middleware } = route;
        if (typeof middleware === 'string') {
          route.middleware = async (ctx) => { // eslint-disable-line
            // 这里需要对文件做一些处理，统一输入
            await send(ctx, normolMiddleware(middleware), { root });
          };
        }
        return route;
      });
      return newRouterConfig;
    };

    const generateRoutes = (config) => {
      config.forEach(({ method, path, middleware }) => {
        this.router[method](path, middleware);
      });
    };

    const { proxy } = this.appConfig;
    // proxy
    try {
      Object.keys(proxy || {}).forEach((context) => {
        let options = proxy[context];
        if (typeof options === 'string') {
          options = { target: options };
        }
        // router.get(options.filter || context, c2k(proxyMiddleware(options)));
        this.router.all(options.filter || context, c2k(proxyMiddleware(options)));
      });
    } catch (error) {
      console.log(error);
    }
    generateRoutes(validateRouterConfig(routerConfig, root));
    isIndex && this.router.redirect('/', this.router.mapRoutes[0]); // eslint-disable-line
    // invoke
    this.app.use(this.router.routes()).use(this.router.allowedMethods());
  }

  bindSigEvent(server) { // eslint-disable-line
    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        server.close();
        process.exit();
      });
    });
  }

  logViewInfo(isClear = true) {
    const { qrcode } = this.config;
    const LOCA = `http://localhost:${this.port}`;
    const ADDR = `http://${address.ip()}:${this.port}`;
    isClear && clearConsole(); // eslint-disable-line
    console.log(`You can now view ${chalk.bold.greenBright(appname)} in the browser.\n`);
    console.log(chalk.green(`Local:            ${chalk.blueBright(`${LOCA}`)}`));
    console.log(chalk.green(`On Your Network:  ${chalk.blueBright(`${ADDR}`)}`));
    console.log();
    if (qrcode) {
      qrcodeTerminal.generate(ADDR, { small: true }, (qr) => {
        console.log(chalk.green('Scan the QR code below:'));
        console.log(chalk.blue(qr));
      });
    }
  }

  autoOpenBrowser() {
    const { autoOpen } = this.config;
    if (autoOpen) {
      let OPEN_URL = `http://localhost:${this.port}`;
      if (typeof autoOpen === 'string') {
        if (this.router.mapRoutes.indexOf(autoOpen) > -1) {
          OPEN_URL += autoOpen;
        }
      }
      openBrowser(OPEN_URL);
    }
  }
}

module.exports = Base;
