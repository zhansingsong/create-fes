/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const glob = require('glob');
const { join, parse, resolve } = require('path');
const paths = require('../../utils/paths');

const viewFiles = glob.sync(join(paths.appSrc, 'views/*.html'), {});
const jsFiles = glob.sync(join(paths.appSrc, 'javascripts/*.+(js)'), {});

module.exports = (env, appConfig) => {
  // 处理 entry 配置项
  const entry = {};

  const commonChunks = [
    resolve(paths.appNodeModules, 'fes-scripts', 'config', 'utils', 'fesContext.js'),
  ];
  if (env === 'development' && appConfig.isHot) {
    commonChunks.push(join(
      paths.appNodeModules,
      'fes-scripts',
      'config',
      'middlewares',
      'hotClient/index?path=/__webpack_hmr&reload=true'
    ));
  }

  jsFiles.forEach((f) => {
    const metas = parse(f);
    entry[metas.name] = commonChunks.slice(0); // init and copy
    entry[metas.name].push(f);
  });

  // 确保没有对应的js文件时不会报错
  if (jsFiles.length !== viewFiles.length) {
    viewFiles.forEach((f) => {
      const metas = parse(f);
      if (!entry[metas.name]) {
        entry[metas.name] = commonChunks.slice(0);
      }
    });
  }

  return entry;
};
