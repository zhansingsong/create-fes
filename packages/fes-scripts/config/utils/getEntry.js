/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const { join, resolve } = require('path');

module.exports = (env, appConfig, paths) => {
  const { entryNames } = paths.fesMap;

  // 处理 entry 配置项
  const entry = {};
  const isDev = env === 'development';

  const commonChunks = [
    resolve(paths.appNodeModules, 'fes-scripts', 'config', 'utils', 'fesContext.js'),
  ];

  if (isDev && appConfig.isHot) {
    const hotClient = process.env.FES_DEV
      ? join(
        paths.appNodeModules,
        'fes-scripts',
        'node_modules',
        'webpack-hot-middleware',
        'client?path=/__webpack_hmr&reload=true'
      )
      : 'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true';

    commonChunks.push(hotClient);
  }

  Object.keys(entryNames).forEach((f) => {
    const { name, isExist } = entryNames[f];
    // 确保没有对应的js文件时不会报错
    if (isDev && !isExist) {
      entry[name] = commonChunks.slice(0); // init and copy
    }
    if (isExist) {
      entry[name] = commonChunks.slice(0); // init and copy
      entry[name].push(f);
    }
  });
  return entry;
};
