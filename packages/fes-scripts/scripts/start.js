require('../utils/pre')('development'); // eslint-disable-line

// const chalk = require('chalk');
const c2k = require('koa2-connect');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');

const paths = require('../utils/paths');
const getDevServer = require('../utils/devServer');

const choosePort = require('../utils/choosePort');

const config = require('../config/webpack.config')('development');

const appConfig = require(paths.appConfig); // eslint-disable-line
const { proxy, isHot, routerConfig } = appConfig;

const devServer = getDevServer(routerConfig, proxy);
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
      compiler.fesHotMiddleware = hot;
      devServer.use(c2k(hot));
    }

    const server = devServer.listen(p, () => {
      // https://github.com/webpack-contrib/webpack-hot-middleware/issues/210
      // solve a hmr bug
      devServer.keepAliveTimeout = 0;
      // console.log(chalk.blue(`devServer is running on ${chalk.bold.cyan(p)} in ${chalk.italic.gray(process.cwd())}`));
    });

    dev.waitUntilValid(() => {
      devServer.emit('qrcode-and-open-browser', p, appConfig);
    });
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

