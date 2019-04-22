const path = require('path');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = process.cwd();
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(pathStr, needsSlash) {
  const hasSlash = pathStr.endsWith('/');
  if (hasSlash && !needsSlash) {
    return pathStr.substr(pathStr, pathStr.length - 1);
  }

  if (!hasSlash && needsSlash) {
    return `${pathStr}/`;
  }

  return pathStr;
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage; // eslint-disable-line

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl = envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

// config after eject: we're in ./config/
module.exports = {
  appDirectory,
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('build'),
  configDir: resolveApp('config'),
  devConfig: resolveApp('config/webpack.dev.config.js'),
  prodConfig: resolveApp('config/webpack.prod.config.js'),
  appConfig: resolveApp('app.config.js'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appApi: resolveApp('src/api'),
  appViews: resolveApp('src/views/*.html'),
  appMocks: resolveApp('src/mock/**/**.+(js|json)'),
  appJsFiles: resolveApp('src/javascripts/*.+(js)'),
  appBabelrc: resolveApp('.babelrc'),
  appTsConfig: resolveApp('tsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
};
