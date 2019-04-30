module.exports = {
  isHot: true,
  // http-proxy-middleware: https://github.com/chimurai/http-proxy-middleware
  proxy: {},
  // babel-loader config: https://github.com/babel/babel-loader
  babelLoader: {},
  // postcss-sprites: https://github.com/2createStudio/postcss-sprites
  spritesConfig: {
    // dpr: v => `${v / 48}rem`,
  },
  // url-loader: https://github.com/webpack-contrib/url-loader
  urlLoader: {},
  // workbox-webpack-plugin: https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
  sw: {},
  // fork-ts-checker-webpack-plugin: https://github.com/Realytics/fork-ts-checker-webpack-plugin#readme
  tsChecker: {},
  extraDependencies: [],
  // webpack resolve.alias
  alias: {},
  provide: {},
  routerConfig: {
    'project/index.html': '/fes/info',
  },
  // https://github.com/webpack-contrib/css-loader#modules
  cssModules: 'global',
  sourceMap: true,
  devtool: 'cheap-module-source-map',
  dev: {
    port: 3000,
    autoOpen: true,
    qrcode: true,
  },
  build: {
    IE8: false,
    publicPath: '/',
    outputhPath: {
      isHash: true,
      css: {
        path: 'static/css/',
      },
      others: 'static/media/',
      img: 'static/media/',
      js: {
        path: 'static/js/',
        filename: '[name].[chunkhash:8].js',
        chunck: '[name].[chunkhash:8].chunk.js',
      },
    },
    report: false,
    isTmpl: true,
  },
  tmpl: {
    port: 3100,
    autoOpen: false,
    qrcode: true,
  },
  preview: {
    port: 3030,
    autoOpen: false,
    qrcode: true,
  },
};
