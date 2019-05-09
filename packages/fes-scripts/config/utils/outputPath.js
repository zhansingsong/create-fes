/* eslint no-nested-ternary: [0] */
module.exports = ({
  isHash, css, others, img, js,
}) => {
  const DEFAULT_PATH_MEDIA = 'static/media/';
  const DEFAULT_PATH_JS = 'static/js/';
  const DEFAULT_PATH_CSS = 'static/css/';
  const cssPath = css ? typeof css === 'string' ? css : css.path || DEFAULT_PATH_CSS : DEFAULT_PATH_CSS;
  const cssFilename = css && css.filename ? css.filename : isHash ? '[name].[contenthash:8].css' : '[name].css';
  const cssChunkFilename = css && css.chunck
    ? css.chunck
    : isHash
      ? '[name].[chunkhash:8].chunk.css'
      : '[name].chunk.css';
  const othersPath = others ? typeof others === 'string' ? others : others.path || DEFAULT_PATH_MEDIA : DEFAULT_PATH_MEDIA;
  const othersFilename = others && others.filename
    ? others.filename
    : isHash
      ? '[name].[contenthash:8].[ext]'
      : '[name].[ext]';
  const imgPath = img ? typeof img === 'string' ? img : img.path || DEFAULT_PATH_MEDIA : DEFAULT_PATH_MEDIA;
  const imgFilename = img && img.filename ? img.filename : isHash ? '[name].[contenthash:8].[ext]' : '[name].[ext]';
  const jsPath = js ? typeof js === 'string' ? js : js.path || DEFAULT_PATH_JS : DEFAULT_PATH_JS;
  const jsFilename = js && js.filename ? js.filename : isHash ? '[name].[contenthash:8].js' : '[name].js';
  const jsChunkFilename = js && js.chunck
    ? js.chunck
    : isHash
      ? '[name].[chunkhash:8].chunk.js'
      : '[name].chunk.js';
  return {
    css: cssPath + cssFilename,
    cssChunk: cssPath + cssChunkFilename,
    others: othersPath + othersFilename,
    img: imgPath + imgFilename,
    js: jsPath + jsFilename,
    jschunk: jsPath + jsChunkFilename,
  };
};
