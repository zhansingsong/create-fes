/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

function HotReload(options) {
  this.options = options;
  this.startTime = Date.now();
  this.prevTimestamps = {};
}

HotReload.prototype.apply = function (compiler) {
  const self = this;
  let once = '';
  compiler.hooks.afterCompile.tap('HotReload', function (compilation) {
    compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('HotReload', (htmlPluginData, callback) => {
      let changedFiles = [];
      // 这种检测方式只基于修改时间，如果时间修改也触发。
      compilation.fileTimestamps.keys().forEach((key) => {
        if ((self.prevTimestamps.get(key) || self.startTime) < (compilation.fileTimestamps.get(key) || Infinity)) {
          changedFiles.push(key);
        }
      });
      // console.log('changedFiles:  ', changedFiles);
      self.prevTimestamps = compilation.fileTimestamps;
      changedFiles.forEach((f) => {
        if (require.cache[f]) {
          delete require.cache[f];
        }
        // delete require.cache[htmlPluginData.plugin.options.dp];
      });
      if (compilation.fesFileDependencies.has(changedFiles[0]) && once !== compilation.hash) {
        once = compilation.hash;
        compiler.fesHotMiddleware.publish({ reload: true });
      }
      changedFiles = [];
      callback(null);
    });
  });
};

module.exports = HotReload;
