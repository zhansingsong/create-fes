const fesData = require('./fesData.js');

module.exports = (router, Mock) => {
  router.get('/fes_api', (ctx, next) => {
    ctx.body = Mock.mock(fesData);
    return next();
  });
};
