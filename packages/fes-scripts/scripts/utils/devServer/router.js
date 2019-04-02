const Router = require('koa-router');
const chalk = require('chalk');
const send = require('koa-send');
const { join, parse, resolve } = require('path');
// const paths = require('../../../config/utils/paths');
const glob = require('glob');
const proxyMiddleware = require('http-proxy-middleware');
const c2k = require('koa2-connect');

const address = require('address');
const opn = require('opn');
const qrcodeTerminal = require('qrcode-terminal');

const mapRoutes = [];

const softExit = (msg, code = 1) => {
  console.error(chalk.bold.red(msg));
  process.exit(code);
};

const isPlainObject = obj =>
  Object(obj) === obj && Object.prototype.toString.call(obj) === '[object Object]';


module.exports = (app, routerConfig, paths, proxy = {}) => {
  // paths
  const viewsTemp = resolve(paths.appNodeModules, 'fes-scripts', '.temp', 'views');
  const views = join(paths.appSrc, 'views/*.html');

  /**
   * get default router config
   * @return {Object} config
   */
  const getDefaultRouterConfig = () => {
    const viewsFiles = glob.sync(views);
    viewsFiles.map((file) => {
      const metas = parse(file);
      const path = `/${metas.name}`;
      mapRoutes.push(path);
      return {
        path,
        method: 'get',
        middleware: async (ctx) => {
          await send(ctx, `${metas.name}.html`, { root: viewsTemp });
        },
      };
    });
  };

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

  const router = new Router();

  /**
   * validate router config
   * @param {Object} routerConfig
   * @return {Object} newRouterConfig
   */
  const validateRouterConfig = (routerConfig = getDefaultRouterConfig()) => { // eslint-disable-line
    if (!isPlainObject(routerConfig)) {
      softExit('\nTypeError: routerConfig expected is a Object.');
    }
    const newRouterConfig = Object.keys(routerConfig).map((key) => {
      mapRoutes.push(key);
      // 对 key 处理： a/b => /a/b
      const route = {
        path: key,
        method: 'get',
      };

      const middleware = routerConfig[key];
      route.middleware = middleware;

      if (!middleware) {
        softExit(`\nError: routerConfig['${key}'] is required in app.config.js`);
      }

      if (typeof middleware === 'string') {
        route.middleware = async (ctx) => {
          // 这里需要对文件做一些处理，统一输入
          await send(ctx, normolMiddleware(middleware), { root: viewsTemp });
        };
      }
      return route;
    });
    return newRouterConfig;
  };

  const generateRoutes = (router, config) => { // eslint-disable-line
    config.forEach(({ method, path, middleware }) => {
      router[method](path, middleware);
    });
  };

  // proxy
  try {
    Object.keys(proxy || {}).forEach((context) => {
      let options = proxy[context];
      if (typeof options === 'string') {
        options = { target: options };
      }
      // router.get(options.filter || context, c2k(proxyMiddleware(options)));
      router.all(options.filter || context, c2k(proxyMiddleware(options)));
    });
  } catch (error) {
    console.log(error);
  }

  // routes
  generateRoutes(router, validateRouterConfig(routerConfig));
  router.redirect('/', mapRoutes[0]);
  // invoke
  app.use(router.routes()).use(router.allowedMethods());
  // generate qr code and open browser with a specific url
  let logTwice = 0;


  const openBrowserCallback = (port, config) => {
    console.log('-----------_~~~~~~~~~~~~~~~~~~~~~_~~~~~~~~~~~~');
    const { qrcode, autoOpen } = config.dev;
    const LOCA = `http://localhost:${port}`;
    const ADDR = `http://${address.ip()}:${port}`;
    if (logTwice === 1) {
      app.removeAllListeners('qrcode-and-open-browser');
      console.log(chalk.green(`server is running on:  ${chalk.blueBright(`${LOCA}`)}`));
      console.log(chalk.green(`server is running on:  ${chalk.blueBright(`${ADDR}`)}`));

      if (qrcode) {
        qrcodeTerminal.generate(ADDR, { small: true }, (qr) => {
          console.log(chalk.green('scan the QR code below:'));
          console.log(chalk.blue(qr));
        });
      }
    }

    let OPEN_URL = LOCA;
    if (autoOpen && logTwice === 0) {
      if (typeof autoOpen === 'string') {
        if (mapRoutes.indexOf(autoOpen) > -1) {
          OPEN_URL += autoOpen;
        }
      }
      opn(OPEN_URL);
    }
    logTwice += 1;
  };
  app.on('qrcode-and-open-browser', openBrowserCallback);
  return (ctx, next) => next();
};
