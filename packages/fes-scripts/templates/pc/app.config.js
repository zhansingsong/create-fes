module.exports = {
  isHot: true,
  // 更多配置参考：https://github.com/chimurai/http-proxy-middleware
  proxy: {},
  // babel-loader config
  // 更多配置参考：https://github.com/babel/babel-loader
  babelLoader: {},
  // 更多配置项参考：https://github.com/2createStudio/postcss-sprites
  spritesConfig: {
    // dpr: v => `${v / 48}rem`, 调整单位及dpr
  },
  // 更多配置项参考：https://github.com/webpack-contrib/url-loader
  urlLoader: {
    limit: 1000,
  },
  // service worker 配置
  // 详细配置参考：https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin
  sw: {
    navigateFallback: '/index',
  },
  // fork-ts-checker-webpack-plugin 配置设置。
  // 详细配置参考：https://github.com/Realytics/fork-ts-checker-webpack-plugin#readme
  tsChecker: {},
  // 增加依赖文件，方便开发修改时，能自动编译
  // 相对于 'src' 目录
  // 支持 "**/*.js" 形式，更多参考 glob：https://github.com/isaacs/node-glob
  extraDedenpencies: [],
  // alias
  alias: {},
  // 自动加载模块配置
  provide: {},
  // router配置
  routerConfig: {
    '/fes/index': 'index.html',
    '/fes/aboutme': 'about.html',
    '/fes/info': 'info.html',
  },
  // css-modules: https://github.com/css-modules/postcss-modules
  cssModules: {},
  sourceMap: true,
  devtool: 'cheap-module-source-map',
  // devtool会导致recompile变慢，特别是source-map
  // devtool: false,
  // devtool: 'eval',
  // devtool: 'source-map',
  // devtool: 'eval-source-map',
  // devtool: 'hidden-source-map',
  // devtool: 'inline-source-map',
  // devtool: 'cheap-module-source-map',
  // devtool: 'inline-eval-cheap-source-map',
  // 对应js，babel会根据devtool设置来开启sourceMap
  // The sourceMap option is ignored, instead sourceMaps are automatically
  // enabled when webpack is configured to use them (via the devtool config option).
  dev: {
    port: 3000,
    // 如果bool，默认打开index，或其中某个页面。如果是字符串(如: '/home')
    // 就当成路径处理。如果路径不存在会回退到bool
    autoOpen: true,
    qrcode: true,
  },
  build: {
    IE8: false,
    mode: 'multi', // 'single', 'multi',
    publicPath: '/',
    outputhPath: {
      // 是否开启hash
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
    // 支持 boolean 、object
    // 如果为boolean，使用默认配置生成分析报告
    // 如果为object, 会根据该配置对象生成分析报告
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    report: false,
    // 是否输出模板
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
