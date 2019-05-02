const merge = require('webpack-merge');

module.exports = (env, paths) => {
  const isDev = env === 'development';
  const preferenceConfig = require(paths[isDev ? 'devConfig' : 'prodConfig']); // eslint-disable-line
  let config = require('../../config/webpack.config.js')(env, paths); // eslint-disable-line
  if (typeof preferenceConfig === 'function') {
    config = preferenceConfig(config, merge);
  }
  return config;
};
