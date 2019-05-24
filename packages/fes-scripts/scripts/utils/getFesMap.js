const { existsSync } = require('fs');
const {
  join, parse, sep, normalize,
} = require('path');
const glob = require('glob');

module.exports = (routerConfig = {}, paths) => {
  const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  // invert
  const invert = obj => Object.assign(...Object.entries(obj).map(([k, v]) => ({ [v]: k })));
  const {
    appSrc, appViews, appMocks, appJsFiles, appBuildTmpl,
  } = paths;
  // common
  const common = {
    js: join(appSrc, 'javascripts', 'common', '**', '**.+(js|ts)'),
    mock: join(appSrc, 'mocks', 'common', '**', '**.+(js|json)'),
  };

  const VIEWS_REG_EXP = new RegExp(`(${escapeRegExp(appViews)})(.*\\.)(\\w*)$`);
  const NETRY_NAME_REG_EXP = new RegExp(`${escapeRegExp(appViews + sep)}(.*)\\.\\w*$`);
  const VIEWS_FILE_REG_EXP = new RegExp(`${escapeRegExp(appViews + sep)}`);
  // routes
  const routes = {};
  // entryNames
  const entryNames = {};
  // entry
  const entry = {};
  // mockFiles
  const mockFiles = {};

  const defaultViewFiles = glob.sync(join(appViews, '*.html')).reduce((defaultRoutes, file) => {
    const metas = parse(file);
    const path = `/${metas.name}`;
    defaultRoutes[normalize(file)] = path; // eslint-disable-line
    return defaultRoutes;
  }, {});
  const customViewFiles = Object.keys(routerConfig).reduce((customRoutes, file) => {
    customRoutes[join(appViews, file)] = routerConfig[file]; // eslint-disable-line
    return customRoutes;
  }, {});
  // viewFiles
  const viewFiles = Object.assign(defaultViewFiles, customViewFiles);
  // jsFiles
  const jsFiles = Object.keys(viewFiles).reduce((jsFilesObj, file) => {
    const filePath = file.replace(VIEWS_REG_EXP, (m, path, f) => `${appJsFiles}${f}js`);
    const globMock = file.replace(VIEWS_REG_EXP, (m, path, f) => `${appMocks}${f}*`);
    const name = file.replace(NETRY_NAME_REG_EXP, (m, n) => n.replace(sep, '_'));

    routes[viewFiles[file]] = file.replace(VIEWS_FILE_REG_EXP, '');
    mockFiles[viewFiles[file]] = globMock;

    entryNames[filePath] = {
      name,
      isExist: false,
      tmplName: file.replace(VIEWS_FILE_REG_EXP, ''),
      tmpl: file,
      route: viewFiles[file],
      mockData: globMock,
      buildTmpl: file.replace(appViews, appBuildTmpl),
    };

    entry[file] = {
      isExist: false,
      name,
    };

    if (existsSync(filePath)) {
      jsFilesObj[filePath] = viewFiles[file];
      entryNames[filePath].isExist = true;
      entry[file].isExist = true;
    }
    return jsFilesObj;
  }, {});
  const chunks = ['vendors', 'commons', 'runtime', 'styles'];
  // twigloader, entry: routes viewFiles mockFiles
  return {
    invert,
    common,
    routes,
    entryNames,
    viewFiles,
    jsFiles,
    mockFiles,
    entry,
    chunks,
  };
};
