/**
 * 处理 entry 配置选项 和 html-webpack-plugin 配置
 * @author zhansingsong
 */

const glob = require('glob');
const { join, parse } = require('path');
const paths = require('../../utils/paths');

const viewFiles = glob.sync(join(paths.appSrc, 'views/*.html'), {});
const jsFiles = glob.sync(join(paths.appSrc, 'javascripts/*.+(js)'), {});
const jsFilesName = jsFiles.map(file => parse(file).name);

const getChunks = (chunk) => {
  const chunks = ['vendors', 'common'];
  if (jsFilesName.indexOf(chunk) > -1) {
    chunks.push(chunk);
  }
  return chunks;
};

module.exports = (env) => {
  // html-webpack-plugin 配置
  const pageConfigs = [];
  viewFiles.forEach((templateFile) => {
    const metas = parse(templateFile);

    const config = {
      template: templateFile,
      inject: true,
      chunks: getChunks(metas.name),
      // excludeChunks: entryNameArr.filter(i => i !== metas.name),
    };

    if (env === 'development') {
      config.filename = join(paths.appConfig, '.temp', `${metas.name}.html`);
      config.alwaysWriteToDisk = true;
    } else {
      config.filename = `${metas.name}.html`;
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
    }
    pageConfigs.push({ ...config });
  });
  return pageConfigs;
};
