const Koa = require('koa');
const serve = require('koa-static');
const router = require('./router');
const chalk = require('chalk');
const mockApi = require('./mockApi');


module.exports = (routerConfig, paths, proxy) => {
  const app = new Koa();
  // onerror
  app.on('error', (err, ctx) => console.error(`\n${chalk.bold.red('Error: ')} ${chalk.red(err)}\n`, ctx, '\n'));
  // router
  app.use(router(app, routerConfig, paths, proxy));
  // static(after router)
  app.use(serve(paths.appDirectory));
  // mockApi
  app.use(mockApi(paths));
  return app;
};

