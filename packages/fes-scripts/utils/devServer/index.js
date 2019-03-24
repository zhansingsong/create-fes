const Koa = require('koa');
const serve = require('koa-static');
const paths = require('../paths');
const router = require('./router');

module.exports = (routerConfig, proxy) => {
  const app = new Koa();
  // onerror
  app.on('error', err => console.error(err));
  // router
  app.use(router(app, routerConfig, proxy));
  // static(after router)
  app.use(serve(paths.appDirectory));
  return app;
};

