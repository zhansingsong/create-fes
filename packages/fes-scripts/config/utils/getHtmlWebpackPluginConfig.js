/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const getChunks = (chunk, isExist, isDev) => {
  const chunks = ['vendors', 'common', 'runtime'];
  if (isExist || isDev) {
    chunks.push(chunk);
  }
  return chunks;
};

module.exports = (env, appConfig, paths) => {
  const { entryNames } = paths.fesMap;
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
      chunks: getChunks(name, isExist, isDev),
    };

    config.filename = tmplName;
    if (!isDev) {
      if (typeof appConfig.htmlMinify === 'boolean') {
        config.minify = appConfig.htmlMinify;
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
    }
    pageConfigs.push({ ...config });
  });
  return pageConfigs;
};
