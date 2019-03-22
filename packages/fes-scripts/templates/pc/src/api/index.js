const fesData = require('./fesData.js');

export default (router) => {
  router.get('/fes_api', (ctx, next) => {
    ctx.body = fesData;
    return next();
  });
};
