/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const getChunks = (chunk, isExist) => {
  const chunks = ['vendors', 'common', 'runtime'];
  if (isExist) {
    chunks.push(chunk);
  }
  return chunks;
};

module.exports = (env, paths) => {
  const { entryNames } = paths.fesMap;
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
      chunks: getChunks(name, isExist),
    };

    config.filename = tmplName;
    config.minify = {
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
    };
    pageConfigs.push({ ...config });
  });
  return pageConfigs;
};
