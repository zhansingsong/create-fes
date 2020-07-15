const svg2font = require('@zhansingsong/svg2font');
const path = require('path');
const Base = require('./utils/Base');

const svgPath = path.join(process.cwd(), 'src', 'assets', 'svg2font', '*.svg');

const cssFileName = '_iconfont.scss';
const stylePath = '~@/assets/iconfont';
const outputPath = {
  font: path.join(process.cwd(), 'src', 'assets', 'iconfont'),
  css: path.join(process.cwd(), 'src', 'styles', 'lib'),
};
svg2font(Object.assign({
  svgPath,
  cssFileName,
  outputPath,
  stylePath,
}, Base.appConfig.svg2font || {}));
