const es3ify = require('es3ify');

module.exports = function (code) {
  this.cacheable();
  return es3ify.transform(code);
};
