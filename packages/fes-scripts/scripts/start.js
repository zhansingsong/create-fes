require('./utils/pre')('development'); // eslint-disable-line

const c2k = require('koa2-connect');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const webpack = require('webpack');
const { join, parse } = require('path');
const glob = require('glob');
const Base = require('./utils/Base');


const base = new Base('dev');
base.run((paths, chalk) => {
  const config = require('./utils/getConfig')('development', paths); // eslint-disable-line
  const compiler = webpack(config);
  // paths
  const viewsTemp = join(paths.appNodeModules, 'fes-scripts', '.temp', 'views');
  const views = join(paths.appSrc, 'views/*.html');

  const getDefaultRouterConfig = () => {
    const viewsFiles = glob.sync(views);
    viewsFiles.map((file) => {
      const metas = parse(file);
      const path = `/${metas.name}`;
      return {
        path,
        method: 'get',
        middleware: `/${metas.name}.html`,
      };
    });
  };
  base.createRouter(base.appConfig.routerConfig || getDefaultRouterConfig(), viewsTemp, true);
  // app dir
  base.app.use(base.serve(paths.appDirectory));
  // public
  base.app.use(base.serve(paths.appPublic));

  const dev = devMiddleware(compiler, {
    // lazy: true,
    // writeToDisk: true,
    logTime: true,
    stats: {
      colors: true,
    },
  });
  // webpack-dev-middleware
  base.app.use(c2k(dev));

  if (base.appConfig.isHot) {
    // bind hotMiddleware to compiler
    const hot = hotMiddleware(compiler);
    base.app.use(c2k(hot));
  }

  const server = base.app.listen(base.port, (err) => { // eslint-disable-line
    if (err) {
      return console.log(err);
    }
    // https://github.com/webpack-contrib/webpack-hot-middleware/issues/210
    // solve a hmr bug
    server.keepAliveTimeout = 0;
    // clear console
    base.clearConsole();
    console.log(chalk.cyan('Starting the development server...\n'));
    return null;
  });

  let limitExecution = 0;
  let doneCallbackTimer;
  const doneCallback = () => {
    // clear staff
    if (limitExecution === 2) {
      doneCallbackTimer && clearTimeout(doneCallbackTimer); // eslint-disable-line
      limitExecution = void (0); // eslint-disable-line
      doneCallbackTimer = null;
      return;
    }
    doneCallbackTimer = setTimeout(function () {// eslint-disable-line
      if (limitExecution === 0) {
        base.autoOpenBrowser();
      }
      if (limitExecution === 1) {
        base.logViewInfo();
      }
      limitExecution += 1;
    }, 100);
  };
  // log browsing address info
  compiler.hooks.done.tap('open-browser-and-address-info', doneCallback);

  base.bindSigEvent(server);
});
