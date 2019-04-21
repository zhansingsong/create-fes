const es3ify = require('es3ify');

module.exports = function (code, inputSourceMap) {
  this.cacheable && this.cacheable();  // eslint-disable-line
  this.callback(null, es3ify.transform(code), inputSourceMap);
};
