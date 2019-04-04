const Mock = require('mockjs');
const { join } = require('path');
const chalk = require('chalk');

module.exports = paths => async (ctx, next) => {
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
        console.log(`${chalk.black.bgYellow('MOCK-APIs')}   ${chalk.bold.green(ctx.method)}  ${chalk.gray('--->')}  ${chalk.dim(ctx.url)}`);
      }
    }
  }
  await next();
};

