const es3ify = require('es3ify');

module.exports = function (code, inputSourceMap) {
  this.cacheable && this.cacheable();  // eslint-disable-line
  this.callback(null, es3ify.transform(code), inputSourceMap);
};

// if (appConfig.build.IE8 && env === 'produnction') {
//       rules.push({
//         test: /\.m?js$/,
//         include: paths.appSrc,
//         loader: require.resolve('./loaders/es3Loader.js'),
//         enforce: 'post',
//       });
//     }
