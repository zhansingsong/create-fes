const glob = require('glob');
const { normalize } = require('path');

// Note: the fileDependencies array is rebuilt in each compilation,
// so your plugin must push its own watched dependencies into each
// compilation to keep them under watch.

function AddDependency(options) {
  this.options = options;
}
// 不能用箭头函数
AddDependency.prototype.apply = function (compiler) { // eslint-disable-line
  const fileDependencies = new Set();
  // compiler.hooks.afterCompile.tapAsync('AddDependency', (compilation, callback) => {
  compiler.hooks.afterCompile.tapAsync('AddDependency', (compilation, callback) => {
    console.log(this);
    this.options.dirs.forEach((dir) => {
      const files = glob.sync(dir, {});
      files.forEach((f) => {
        // normalize解决Windows下路径分隔符bug
        const normalizeFile = normalize(f);
        fileDependencies.add(normalizeFile);
        if (Array.isArray(compilation.fileDependencies)) {
          compilation.fileDependencies.push(normalizeFile);
        } else {
          compilation.fileDependencies.add(normalizeFile);
        }
      });
    });
    compilation.fesFileDependencies = fileDependencies; // eslint-disable-line
    callback(null);
  });
};

module.exports = AddDependency;
