const glob = require('glob');
const { normalize, join } = require('path');

function AddExtraEntryFile(options) {
  this.options = options;
}

AddExtraEntryFile.prototype.apply = function (compiler) {
  let extraDependenciesFiles = [];
  const { base } = this.options;
  if (this.options.extra.length > 0) {
    const extraDependencies = this.options.extra;
    try {
      extraDependencies.forEach((dependency) => {
        extraDependenciesFiles = extraDependenciesFiles.concat(glob.sync(join(base, dependency), {}));
      });
    } catch (error) {} // eslint-disable-line
  }

  compiler.hooks.entryOption.tap('AddExtraEntryFile', () => {
    const extraFilesArr = this.options.dirs.map((dir) => {
      const files = glob.sync(dir, {});
      return files.map((f) => {
        // normalize解决Windows下路径分隔符bug
        const normalizeFile = normalize(f);
        return normalizeFile;
      });
    });

    const { options } = compiler;
    const { entry, mode } = options;
    const entries = Object.keys(entry);
    if (mode === 'development') {
      entries.forEach((name) => {
        extraFilesArr.forEach(files => files.forEach((f) => {
          entry[name].push(f);
        }));
        entry[name].push(...extraDependenciesFiles);
      });
    }
  });
};

module.exports = AddExtraEntryFile;
