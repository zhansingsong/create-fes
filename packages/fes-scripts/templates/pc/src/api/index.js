/**
 * ! export fun, in order to bind mock method(this.mock)
 * *
 * * builtin methods:
 * * ************
 * * this.mock(path)
 * * parse mock data by mock.js
 * * @param {String} path
 * *
 * * all methods supported by koa，but works in others(ctx) method.
 * * refer to https://github.com/koajs/koa
 */
module.exports = function api() {
  return {
    '/fes_api': this.mock('./fesData.js'), // parse mock data by mock.js
    '/fes_api_1': function fes() {
      return {
        data: 'davdddvv',
        others(ctx) {
          ctx.status = 301;
        },
      };
    },
    '/fes_api_2': () => ({
      data: 'singadafafosng',
      others(ctx) {
        ctx.status = 200;
      },
    }),
    '/fes_api_3': 'haha909',
    '/fes_api_4': '0909',
  };
};
