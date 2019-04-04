require('./utils/pre')('development'); // eslint-disable-line

const chalk = require('chalk');
const c2k = require('koa2-connect');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const paths = require('./utils/paths');
const getDevServer = require('./utils/devServer');
const choosePort = require('./utils/choosePort');
const config = require('../config/webpack.config')('development');
const address = require('address');
const qrcodeTerminal = require('qrcode-terminal');

const appname = require(paths.appPackageJson).name; // eslint-disable-line

const clearConsole = require('./utils/clearConsole');
const openBrowser = require('./utils/openBrowser');


const appConfig = require(paths.appConfig); // eslint-disable-line
const { proxy, isHot, routerConfig } = appConfig;

const devServer = getDevServer(routerConfig, paths, proxy);
const compiler = webpack(config);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || appConfig.dev.port;
const HOST = process.env.HOST || '0.0.0.0';
choosePort(HOST, DEFAULT_PORT)
  .then((p) => {
    if (p == null) {
      return;
    }
    const dev = devMiddleware(compiler, {
      // lazy: true,
      logTime: true,
      stats: {
        colors: true,
      },
    });
    // webpack-dev-middleware
    devServer.use(c2k(dev));

    if (isHot) {
      // bind hotMiddleware to compiler
      const hot = hotMiddleware(compiler);
      devServer.use(c2k(hot));
    }

    const autoOpenBrowser = (port, autoOpen, mapRoutes) => {
      if (autoOpen) {
        let OPEN_URL = `http://localhost:${port}`;
        if (typeof autoOpen === 'string') {
          if (mapRoutes.indexOf(autoOpen) > -1) {
            OPEN_URL += autoOpen;
          }
        }
        openBrowser(OPEN_URL);
      }
    };

    const server = devServer.listen(p, (err) => {
      if (err) {
        return console.log(err);
      }
      // https://github.com/webpack-contrib/webpack-hot-middleware/issues/210
      // solve a hmr bug
      server.keepAliveTimeout = 0;
      // clear console
      clearConsole();
      console.log(chalk.cyan('Starting the development server...\n'));
      return null;
    });
    const logViewInfo = (port, qrcode, appname) => { // eslint-disable-line
      const LOCA = `http://localhost:${port}`;
      const ADDR = `http://${address.ip()}:${port}`;
      clearConsole();
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
    };
    let limitExecution = 0;
    let doneCallbackTimer;
    const doneCallback = () => {
      // clear staff
      if (limitExecution === 2) {
        doneCallbackTimer && clearTimeout(doneCallbackTimer); // eslint-disable-line
        limitExecution = void(0); // eslint-disable-line
        doneCallbackTimer = null;
        return;
      }
      doneCallbackTimer = setTimeout(function(){// eslint-disable-line
        if (limitExecution === 0) {
          autoOpenBrowser(p, appConfig.dev.autoOpen, devServer.mapRoutes);
        }
        if (limitExecution === 1) {
          logViewInfo(p, appConfig.dev.qrcode, appname);
        }
        limitExecution += 1;
      }, 100);
    };
    // log browsing address info
    compiler.hooks.done.tap('open-browser-and-address-info', doneCallback);

    // singnal
    ['SIGINT', 'SIGTERM'].forEach((sig) => {
      process.on(sig, () => {
        server.close();
        process.exit();
      });
    });
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
