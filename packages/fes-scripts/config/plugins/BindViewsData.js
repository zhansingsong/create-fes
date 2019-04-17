function BindViewsData(options) {
  this.options = options || {};
}

BindViewsData.prototype.apply = function (compiler) {
  const storeData = (compilation, htmlPluginData, callback) => {
    global.__fes_bind_views_data__ = global.__fes_bind_views_data__ || {}; // eslint-disable-line
    global.__fes_bind_views_data__[htmlPluginData.outputName] = compilation.assets[ // eslint-disable-line
      htmlPluginData.outputName
    ].source();
    callback(null);
  };

  if (compiler.hooks) {
    // webpack 4 support
    compiler.hooks.compilation.tap('BindViewsData', (compilation) => {
      if (compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration) {
        compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync(
          'BindViewsData',
          (htmlPluginData, callback) => {
            storeData(compilation, htmlPluginData, callback);
          }
        );
      } else {
        // HtmlWebPackPlugin 4.x
        const HtmlWebpackPlugin = require('html-webpack-plugin'); // eslint-disable-line
        const hooks = HtmlWebpackPlugin.getHooks(compilation);

        hooks.afterEmit.tapAsync('BindViewsData', (htmlPluginData, callback) => {
          storeData(compilation, htmlPluginData, callback);
        });
      }
    });
  }
};

module.exports = BindViewsData;
