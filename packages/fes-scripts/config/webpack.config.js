// common plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const {
  IgnorePlugin,
  NamedModulesPlugin,
  HotModuleReplacementPlugin,
  optimize,
  ProvidePlugin,
} = require('webpack');
const getHtmlWebpackPluginConfigs = require('./utils/getHtmlWebpackPluginConfig');
const sprites = require('./plugins/sprites');

// dev plugins
const AddExtraEntryFile = require('./plugins/AddExtraEntryFile');

// build plugins
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzer = require('webpack-bundle-analyzer');
const BuildTmpl = require('./plugins/BuildTmpl');

// utils
const outputPathFn = require('./utils/outputPath');
const getEntry = require('./utils/getEntry');
const paths = require('../scripts/utils/paths');

const { join, parse } = require('path');

const appConfig = require(join(process.cwd(), 'app.config.js')); //eslint-disable-line

const alias = {
  // Support React Native Web
  // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
  '@': paths.appSrc,
  ...appConfig.alias,
};


const { sourceMap, devtool } = appConfig.build;
const outputhPath = outputPathFn(appConfig.build.outputhPath);


/**
 * get config.output
 * @param {String} env 'development' or 'production'
 */
const getOutput = (env) => {
  let output = {
    path: paths.appBuild,
    publicPath: appConfig.build.publicPath,
    filename: `${outputhPath.js}`,
    chunkFilename: `${outputhPath.jschunk}`,
  };

  if (env === 'development') {
    output = {
      publicPath: '/',
      // path: paths.appBuild,
      filename: 'static/js/[name].[hash:8].js',
      chunkFilename: 'static/js/[name].[hash:8].chunk.js',
    };
  }
  return output;
};


/**
 * get config.plugins
 * @param {String} env 'development' or 'production'
 */
const getPlugins = (env) => {
  const plugins = [];
  // provide global variables
  plugins.push(new ProvidePlugin(appConfig.provide));
  // extract a mini css file
  plugins.push(new MiniCssExtractPlugin({ filename: 'static/media/index.[name].css' }));
  // generate htmls
  const htmlWebpackPluginConfigs = getHtmlWebpackPluginConfigs(env, paths);
  htmlWebpackPluginConfigs.forEach((config) => {
    plugins.push(new HtmlWebpackPlugin(config));
  });

  if (env === 'production') {
    plugins.push(new CleanWebpackPlugin(paths.appBuild, { root: process.cwd() }));
    // 解决IE低版本：https://github.com/zuojj/fedlab/issues/5
    plugins.push(...[
      new UglifyJsPlugin({
        test: /\.js($|\?)/i,
        parallel: true,
        uglifyOptions: {
          compress: {
            properties: false,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebookincubator/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            pure_funcs: ['console.log', 'console.dir'],
          },
          // 可能引起IE低版本不正常运行
          mangle: false,
          output: {
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebookincubator/create-react-app/issues/2488
            ascii_only: true,
            quote_keys: true,
          },
        },
        sourceMap: false,
      }),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        seed: { name: 'sed' },
        generate: (seed, files) => {
          // 生成自定义manifest
          const commonScripts = {};
          const commonCss = {};
          const scriptFiles = {};
          const cssFiles = {};
          const assets = {};
          const htmlFiles = {};
          const manifestFile = {
            commonScripts,
            commonCss,
            scriptFiles,
            cssFiles,
            assets,
            htmlFiles,
          };

          files.forEach((item) => {
            if (/.css$/.test(item.name)) {
              if (item.chunk && item.chunk.chunkReason) {
                commonCss[item.name] = item.path;
              } else {
                cssFiles[item.name] = item.path;
              }
            }
            if (/.js$/.test(item.name)) {
              if (item.chunk && item.chunk.chunkReason) {
                commonScripts[item.name] = item.path;
              } else {
                scriptFiles[item.name] = item.path;
              }
            }
            if (/.html$/.test(item.name) && item.isAsset) {
              htmlFiles[item.name] = item.path;
            }
            if (item.isAsset && item.isModuleAsset) {
              assets[item.name] = item.path;
            }
          });
          return manifestFile;
        },

      }),
    ]);

    if (appConfig.build.isTmpl) {
      plugins.push(new BuildTmpl());
    }
    /* eslint no-extra-boolean-cast: [0] */
    if (!!appConfig.build.report) {
      const report = typeof appConfig.build.report === 'object' ? appConfig.build.report : {};
      plugins.push(new BundleAnalyzer.BundleAnalyzerPlugin(report));
    }
  } else {
    plugins.push(new HtmlWebpackHarddiskPlugin());
    plugins.push(new AddExtraEntryFile({
      dirs: [
        join(paths.appSrc, '/mock/*.+(js|json)'),
        join(paths.appSrc, '/views/**/**.html'),
      ],
    }));
    plugins.push(...[new optimize.OccurrenceOrderPlugin(), new HotModuleReplacementPlugin()]);
  }
  // other plugins
  plugins.push(...[
    new NamedModulesPlugin(),
    new IgnorePlugin(/^\.\/locale$/, /moment$/, /\.json$/),
  ]);

  return plugins;
};


/**
 * get config.module.rules
 * @param {String} env 'development' or 'production'
 */
const getRules = (env) => {
  const oneOf = [
    {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      loader: require.resolve('url-loader'),
      options: {
        limit: 10,
        name: `${outputhPath.img}`,
      },
    },
  ];
  if (appConfig.isBabel) {
    oneOf.push({
      test: /\.m?js$/,
      include: paths.appSrc,
      loader: require.resolve('babel-loader'),
      options: {
        compact: env === 'production',
        cacheDirectory: env === 'development',
        // This is a feature of `babel-loader` for webpack (not Babel itself).
        // It enables caching results in ./node_modules/.cache/babel-loader/
        // directory for faster rebuilds.
      },
    });
  }

  // scss
  oneOf.push({
    test: /\.scss$/,
    use: [
      // style-loader support hmr but MiniCssExtractPlugin not
      env === 'development' ? {
        loader: require.resolve('style-loader'),
        options: {
          // hmr: false
          sourceMap: true,
        },
      } : MiniCssExtractPlugin.loader,
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 2,
          minimize: true,
          sourceMap: true,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebookincubator/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'), //eslint-disable-line
            autoprefixer({
              browsers: ['>0%'],
              flexbox: 'no-2009',
            }),
            sprites({
              ...{
                alias,
                spritePath: join(paths.appSrc, 'assets/'),
                filterBy: (image) => {
                  if (join(paths.appSrc, 'assets', 'sprite') === parse(image.path).dir) {
                    return Promise.resolve();
                  }
                  return Promise.reject();
                },
              },
              ...appConfig.spritesConfig,
            }),
          ],
          sourceMap: true,
        },
      },
      {
        loader: require.resolve('sass-loader'),
        options: {
          sourceMap: true,
        },
      },
    ],
  });
  // html
  oneOf.push({
    test: /\.html$/,
    use: [
      {
        loader: require.resolve('./loaders/htmlLoader/index.js'),
        // loader: require.resolve(paths.appNodeModules, 'fes-scripts', 'config', 'loaders', 'htmlLoader/index.js'),
        options: {
          interpolate: 'require',
          attrs: ['img:src', 'img:data-src', 'img:data-original'],
        },
      },
      { loader: require.resolve('./loaders/twigLoader.js'), options: {} },
      // { loader: require.resolve(paths.appNodeModules, 'fes-scripts', 'config', 'loaders', 'twigLoader.js'), options: {} },
    ],
  });
  // other resource
  oneOf.push({
    // Exclude `js` files to keep "css" loader working as it injects
    // its runtime that would otherwise processed through "file" loader.
    // Also exclude `html` and `json` extensions so they get processed
    // by webpacks internal loaders.
    exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
    loader: require.resolve('file-loader'),
    options: {
      name: `${outputhPath.others}`,
    },
  });
  const rules = [
    {
      oneOf,
    },
  ];
  if (env === 'produnction') {
    rules.push({
      test: /\.m?js$/,
      include: paths.appSrc,
      loader: require.resolve('./loaders/es3Loader.js'),
      enforce: 'post',
    });
  }

  return rules;
};


/**
 * get config
 * @param {String} env 'development' or 'production'
 */
module.exports = (env) => {
  const finalConfig = {
    mode: env,
    entry: getEntry(env, appConfig, paths),
    output: getOutput(env),
    module: {
      rules: getRules(env),
    },
    resolve: {
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
      alias,
    },
    devtool,
    plugins: getPlugins(env),
    // cache: true,
    performance: {
      hints: false,
    },
  };

  if (env === 'production') {
    finalConfig.optimization = {
      minimize: false,
      runtimeChunk: 'single', // 将runtime提出来便于缓存
      splitChunks: {
        chunks: 'all',
        automaticNameDelimiter: '.',
        name: true,
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            minSize: 0,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };
  }
  return finalConfig;
};
