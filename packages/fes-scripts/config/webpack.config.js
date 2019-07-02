// common plugins
const isWsl = require('is-wsl');
const fs = require('fs-extra');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');

const {
  IgnorePlugin,
  NamedModulesPlugin,
  HotModuleReplacementPlugin,
  optimize,
  ProvidePlugin,
} = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzer = require('webpack-bundle-analyzer');
const { join, parse } = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const getHtmlWebpackPluginConfigs = require('./utils/getHtmlWebpackPluginConfig');
const sprites = require('./plugins/sprites');

// dev plugins
const AddExtraEntryFile = require('./plugins/AddExtraEntryFile');
const BindViewsData = require('./plugins/BindViewsData');

// build plugins
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // eslint-disable-line
const BuildTmpl = require('./plugins/BuildTmpl');

// utils
const outputPathFn = require('./utils/outputPath');
const getEntry = require('./utils/getEntry');
const getMockData = require('./utils/getMockData');

// share data
const sharedData = {};
// style regExp
// let styleRegExp = '';

/**
 * get config.output
 */
const getOutput = (env, appConfig, outputhPath, paths) => {
  let output = {
    path: paths.appBuild,
    pathinfo: false,
    publicPath: appConfig.build.publicPath,
    filename: `${outputhPath.js}`,
    chunkFilename: `${outputhPath.jschunk}`,
  };

  if (env === 'development') {
    output = {
      publicPath: '/',
      // path: paths.appBuild,
      filename: 'static/js/[name].js',
      chunkFilename: 'static/js/[name].chunk.js',
    };
  }
  return output;
};

/**
 * get config.plugins
 */
const getPlugins = (env, appConfig, outputhPath, useTypescript, paths) => {
  const plugins = [];
  // provide global variables
  plugins.push(new ProvidePlugin(appConfig.provide));
  // extract a mini css file
  // because of css-hot-loader，file name without [hash] and [hashcontent]
  plugins.push(
    new MiniCssExtractPlugin({
      filename: outputhPath.css,
      chunkFilename: outputhPath.cssChunk,
    })
  );
  // generate htmls
  const htmlWebpackPluginConfigs = getHtmlWebpackPluginConfigs(env, appConfig, paths);
  htmlWebpackPluginConfigs.forEach((config) => {
    plugins.push(new HtmlWebpackPlugin(config));
  });

  if (env === 'production') {
    plugins.push(new CleanWebpackPlugin(paths.appBuild, { root: process.cwd() }));
    // if (!appConfig.build.debug) {
    //   plugins.push(new OptimizeCssAssetsPlugin(Object.assign({}, appConfig.build.optimizeCssAssetsPlugin)));
    // }
    // 解决IE低版本：https://github.com/zuojj/fedlab/issues/5
    plugins.push(
      ...[
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
              if (/\.css$/.test(item.name)) {
                if (item.chunk && item.chunk.chunkReason) {
                  commonCss[item.name] = item.path;
                } else {
                  cssFiles[item.name] = item.path;
                }
              }
              if (/\.js$/.test(item.name)) {
                if (
                  (item.chunk && item.chunk.chunkReason)
                  || paths.fesMap.chunks.some(i => item.name.split('.')[0] === i)
                ) {
                  commonScripts[item.name] = item.path;
                } else {
                  scriptFiles[item.name] = item.path;
                }
              }
              if (/\.html$/.test(item.name) && item.isAsset) {
                htmlFiles[item.name] = item.path;
              }
              if (item.isAsset && item.isModuleAsset) {
                assets[item.name] = item.path;
              }
            });
            // fesMap
            manifestFile.entry = paths.fesMap.entry;

            return manifestFile;
          },
        }),
      ]
    );
    plugins.push(
      new WorkboxWebpackPlugin.GenerateSW(
        Object.assign(
          {
            clientsClaim: true,
            exclude: [/\.map$/, /asset-manifest\.json$/],
            navigateFallback: '/',
            navigateFallbackBlacklist: [
              // Exclude URLs starting with /_, as they're likely an API call
              new RegExp('^/_'),
              // Exclude URLs containing a dot, as they're likely a resource in
              // public/ and not a SPA route
              new RegExp('/[^/]+\\.[^/]+$'),
            ],
          },
          appConfig.sw
        )
      )
    );

    if (appConfig.build.isTmpl) {
      plugins.push(new BuildTmpl({ sharedData, paths }));
    }
    /* eslint no-extra-boolean-cast: [0] */
    if (!!appConfig.build.report) {
      const report = typeof appConfig.build.report === 'object' ? appConfig.build.report : {};
      plugins.push(new BundleAnalyzer.BundleAnalyzerPlugin(report));
    }
  } else {
    // plugins.push(new HtmlWebpackHarddiskPlugin());
    plugins.push(new BindViewsData());
    plugins.push(
      new AddExtraEntryFile({
        dirs: [join(paths.appSrc, '/mocks/**/**.+(js|json)'), join(paths.appSrc, '/views/*.html')],
        extra: appConfig.extraDependencies || [],
        base: paths.appSrc,
      })
    );
    plugins.push(...[new optimize.OccurrenceOrderPlugin(), new HotModuleReplacementPlugin()]);
  }
  if (useTypescript) {
    plugins.push(
      new ForkTsCheckerWebpackPlugin(
        Object.assign(
          {
            async: env === 'development',
            useTypescriptIncrementalApi: true,
            checkSyntacticErrors: true,
            tsconfig: paths.appTsConfig,
            reportFiles: ['**/*.{ts,tsx}'],
            watch: paths.appSrc,
            silent: true,
          },
          appConfig.tsChecker
        )
      )
    );
  }
  // other plugins
  plugins.push(
    ...[new NamedModulesPlugin(), new IgnorePlugin(/^\.\/locale$/, /moment$/, /\.json$/)]
  );

  return plugins;
};

/**
 * get config.optimization
 * https://webpack.js.org/guides/build-performance#avoid-extra-optimization-steps
 */
const getOptimization = (env, sourceMap, appConfig) => {
  const {
    debug, foolMode, optimizeCssAssetsPlugin, splitChunks,
  } = appConfig.build;

  return env === 'development'
    ? {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      // splitChunks: false,
      splitChunks: {
        chunks: 'all',
        name: false,
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            minSize: 0,
          },
        },
      },
      // extract webpack runtime
      runtimeChunk: { name: 'vendors' },
    }
    : {
      removeAvailableModules: true,
      removeEmptyChunks: true,
      minimize: !debug,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            compress: {
              properties: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
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
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
          // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
          parallel: !isWsl,
          // Enable file caching
          cache: true,
          sourceMap,
        }),
        new OptimizeCssAssetsPlugin(Object.assign({}, optimizeCssAssetsPlugin)),
      ],
      // eslint-disable-next-line
        runtimeChunk: foolMode
        ? false
        : {
          name: 'vendors',
        }, // 将runtime提出来便于缓存
      // eslint-disable-next-line
        splitChunks:
          splitChunks
          || (foolMode
            ? false
            : {
              chunks: 'all',
              name: false,
              cacheGroups: {
                // （enforce: true）bug: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/85
                // styles: {
                //   name: 'styles',
                //   test: styleRegExp,
                //   priority: 30,
                //   minChunks: 1,
                //   reuseExistingChunk: true,
                // },
                vendors: {
                  name: 'vendors',
                  test: /[\\/]node_modules[\\/]/,
                },
                commons: {
                  name: 'commons',
                  minChunks: 2,
                  minSize: 0,
                },
              },
            }),
    };
};

/**
 * get config
 * @param {String} env 'development' or 'production'
 */
module.exports = (env, paths) => {
  const useBabel = fs.existsSync(paths.appBabelrc);
  const useTypescript = fs.existsSync(paths.appTsConfig);

  const appConfig = require(paths.appConfig); //eslint-disable-line

  const alias = {
    // Support React Native Web
    // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
    '@': paths.appSrc,
    ...appConfig.alias,
  };
  const { devtool, sourceMap } = appConfig[
    env === 'development' || appConfig.build.debug ? 'dev' : 'build'
  ];
  const outputhPath = outputPathFn(appConfig.build.outputhPath);

  /**
   * get config.module.rules
   */
  const getRules = () => {
    const oneOf = [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: require.resolve('url-loader'),
        options: Object.assign(
          {
            limit: 1000,
            name: `${outputhPath.img}`,
          },
          appConfig.urlLoader
        ),
      },
    ];
    if (useBabel) {
      oneOf.push(
        Object.assign(
          {
            test: /\.(js|mjs|jsx|ts|tsx)$/,
            include: paths.appSrc,
            // disable to use 'require.resolve('babel-loader')'
            loader: 'babel-loader',
            options: {
              compact: env === 'production',
              cacheDirectory: env === 'development',
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
            },
          },
          appConfig.babelLoader
        )
      );
    }

    const postcssPlugins = () => {
      const finalPlugins = [];
      finalPlugins.push(require('postcss-flexbugs-fixes')); // eslint-disable-line
      finalPlugins.push(
        autoprefixer({
          flexbox: 'no-2009',
        })
      );
      finalPlugins.push(
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
        })
      );
      return finalPlugins;
    };

    // scss
    const cssUse = [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          // only enable hot in development
          hmr: env === 'development',
          // if hmr does not work, this is a forceful method.
          reloadAll: true,
        },
      },
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 2,
          sourceMap,
          modules: appConfig.cssModules,
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebookincubator/create-react-app/issues/2677
          ident: 'postcss',
          plugins: postcssPlugins,
          sourceMap,
        },
      },
    ];
    let cssTest = /\.css$/;
    const { styleLoader } = appConfig;
    if (styleLoader) {
      if (!styleLoader.loader && !styleLoader.test) {
        cssTest = /\.(scss|sass)$/;
        cssUse.push({
          loader: require.resolve('sass-loader'),
          options: { sourceMap },
        });
      } else {
        if (!styleLoader.loader) {
          console.error('fes-styleLoader.loader is required but missing.');
          process.exit(1);
        }
        if (!styleLoader.test) {
          console.error('fes-styleLoader.test is required but missing.');
          process.exit(1);
        }
        cssTest = styleLoader.test;
        cssUse.push({
          loader: styleLoader.loader,
          options: styleLoader.options || { sourceMap },
        });
      }
    }
    oneOf.push({
      test: cssTest,
      use: cssUse,
    });
    // styleRegExp = cssTest;

    // html
    const { tmplLoader = {} } = appConfig;
    const htmlTest = tmplLoader.test || /\.html$/;
    const htmlLoader = tmplLoader.loader || require.resolve('./loaders/twigLoader.js');
    const htmlOptions = tmplLoader.options || {};
    oneOf.push({
      test: htmlTest,
      include: paths.appViews,
      use: [
        {
          loader: require.resolve('./loaders/htmlLoader/index.js'),
          options: Object.assign(
            {
              interpolate: 'require',
              attrs: ['img:src', 'img:data-src', 'img:data-original'],
              sharedData: env === 'development' ? null : sharedData,
            },
            appConfig.htmlLoaderOptions
          ),
        },
        { loader: htmlLoader, options: { getMockData: getMockData(paths, appConfig.mockConfig || {}), ...htmlOptions } },
      ],
    });
    // other resource
    oneOf.push({
      // Exclude `js` files to keep "css" loader working as it injects
      // its runtime that would otherwise processed through "file" loader.
      // Also exclude `html` and `json` extensions so they get processed
      // by webpacks internal loaders.
      exclude: [/\.(js|jsx|mjs|ts|tsx)$/, /\.html$/, /\.json$/],
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
    return rules;
  };

  const finalConfig = {
    mode: env,
    bail: env === 'production',
    entry: getEntry(env, appConfig, paths),
    output: getOutput(env, appConfig, outputhPath, paths),
    module: {
      rules: getRules(),
    },
    resolve: {
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      modules: ['node_modules', paths.appNodeModules],
      extensions: ['.js', '.web.js', '.mjs', '.json', '.web.jsx', '.jsx'].concat(
        useTypescript ? ['.ts', '.tsx'] : []
      ),
      alias,
    },
    resolveLoader: {
      modules: ['node_modules', paths.appNodeModules],
    },
    devtool,
    plugins: getPlugins(env, appConfig, outputhPath, useTypescript, paths),
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },

    optimization: getOptimization(env, sourceMap, appConfig),
    // cache: true,
    performance: {
      hints: false,
    },
  };

  return finalConfig;
};
