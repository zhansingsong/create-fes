/* eslint no-nested-ternary: [0] */
module.exports = ({
  isHash, css, others, img, js,
}) => {
  const cssPath = typeof css === 'string' ? css : css.path;
  const cssFilename = css.filename ? css.filename : isHash ? '[name].[contenthash:8].css' : '[name].css';
  const othersPath = typeof others === 'string' ? others : others.path;
  const othersFilename = others.filename
    ? others.filename
    : isHash
      ? '[name].[hash:8].[ext]'
      : '[name].[ext]';
  const imgPath = typeof img === 'string' ? img : img.path;
  const imgFilename = img.filename ? img.filename : isHash ? '[name].[hash:8].[ext]' : '[name].[ext]';
  const jsPath = typeof js === 'string' ? js : js.path;
  const jsFilename = js.filename ? js.filename : isHash ? '[name].[chunkhash:8].js' : '[name].js';
  const jschunkFilename = js.chunck
    ? js.chunck
    : isHash
      ? '[name].[chunkhash:8].chunk.js'
      : '[name].js';

  return {
    css: cssPath + cssFilename,
    others: othersPath + othersFilename,
    img: imgPath + imgFilename,
    js: jsPath + jsFilename,
    jschunk: jsPath + jschunkFilename,
  };
};
