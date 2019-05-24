/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const getChunks = (chunk, isExist, isDev, chunks) => {
  // 生成chunks副本
  const tempChunks = chunks.slice(0);
  if (isExist || isDev) {
    tempChunks.push(chunk);
  }
  return tempChunks;
};

module.exports = (env, appConfig, paths) => {
  const { entryNames, chunks } = paths.fesMap;
  const isDev = env === 'development';
  // html-webpack-plugin 配置
  const pageConfigs = [];
  Object.keys(entryNames).forEach((templateFile) => {
    const {
      name, isExist, tmplName, tmpl,
    } = entryNames[templateFile];

    const config = {
      template: tmpl,
      // avoid FOUC to inject script head tag
      inject: true,
      chunks: getChunks(name, isExist, isDev, chunks),
    };

    config.filename = tmplName;
    const { htmlMinify, debug } = appConfig.build;
    if (!isDev) {
      if (typeof htmlMinify === 'boolean') {
        config.minify = htmlMinify;
      } else {
        config.minify = Object.assign({
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        }, appConfig.htmlWebpackMinfy || {});
      }
      if (debug) {
        config.minify = false;
      }
    }
    pageConfigs.push({ ...config });
  });
  return pageConfigs;
};
