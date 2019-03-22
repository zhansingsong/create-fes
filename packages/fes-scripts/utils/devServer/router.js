const Router = require('koa-router');
const chalk = require('chalk');

const softExit = (msg, code = 1) => {
  console.error(chalk.bold.red(msg));
  process.exit(code);
};

const isPlainObject = obj => Object(obj) === obj && Object.prototype.toString.call(obj) === '[object Object]';

const router = new Router();
const validateRouterConfig = (routerConfig) => {
  if (!isPlainObject(routerConfig)) {
    softExit('\nTypeError: routerConfig expected is a Object.');
  }
  const newRouterConfig = Object.keys(routerConfig).map((key) => {
    // 对 key 处理： a/b => /a/b
    const route = {
      path: key,
      method: 'get',
    };

    let middleware = routerConfig[key];

    if (!middleware) {
      softExit(`\nError: routerConfig['${key}'] is required in app.config.js`);
    }
    if (typeof middleware === 'string') {
      middleware = async (ctx) => {
        // 这里需要对文件做一些处理，统一输入
        await ctx.render(middleware);
      };
    }
    route.middleware = middleware;
    return route;
  });
  return newRouterConfig;
};

const generateRoutes = (router, config) => { // eslint-disable-line
  config.forEach(({ method, path, middleware }) => {
    router[method](path, middleware);
  });
};

module.exports = (app, routerConfig) => {
  generateRoutes(router, validateRouterConfig(routerConfig));
  app.use(router.routes()).use(router.allowedMethods());

  return (ctx, next) => next();
};
