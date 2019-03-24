const es3ify = require('es3ify');

module.exports = function (code, inputSourceMap) {
  this.cacheable();
  return es3ify.transform(code);
};
