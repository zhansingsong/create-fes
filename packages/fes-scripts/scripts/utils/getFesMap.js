const { existsSync } = require('fs');
const { join, parse, sep } = require('path');
const glob = require('glob');

module.exports = (routerConfig = {}, paths) => {
  const invert = obj => Object.assign(...Object.entries(obj).map(([k, v]) => ({ [v]: k })));
  const {
    appSrc, appViews, appMocks, appJsFiles, appBuildTmpl,
  } = paths;
  const common = {
    js: join(appSrc, 'javascripts', 'common', '**', '**.+(js|ts)'),
    mock: join(appSrc, 'mocks', 'common', '**', '**.+(js|json)'),
  };

  const VIEWS_REG_EXP = new RegExp(`(${appViews})(.*\\.)(\\w*)$`);
  const NETRY_NAME_REG_EXP = new RegExp(`${appViews}${sep}(.*)\\.\\w*$`);
  const VIEWS_FILE_REG_EXP = new RegExp(`${appViews}${sep}`);

  const routes = {};
  const entryNames = {};
  const defaultViewFiles = glob
    .sync(join(appSrc, 'views/*.html'))
    .reduce((defaultRoutes, file) => {
      const metas = parse(file);
      const path = `/${metas.name}`;
      defaultRoutes[file] = path; // eslint-disable-line
      return defaultRoutes;
    }, {});

  const customViewFiles = Object.keys(routerConfig).reduce((customRoutes, file) => {
    customRoutes[join(appViews, file)] = routerConfig[file]; // eslint-disable-line
    return customRoutes;
  }, {});

  const viewFiles = Object.assign(defaultViewFiles, customViewFiles);


  const jsFiles = Object.keys(viewFiles).reduce((jsFilesObj, file) => {
    routes[viewFiles[file]] = file.replace(VIEWS_FILE_REG_EXP, '');
    const filePath = file.replace(VIEWS_REG_EXP, (m, path, f) => `${appJsFiles}${f}js`);
    entryNames[filePath] = {
      name: file.replace(NETRY_NAME_REG_EXP, (m, n) => n.replace(sep, '_')),
      isExist: false,
      tmplName: file.replace(VIEWS_FILE_REG_EXP, ''),
      tmpl: file,
      route: viewFiles[file],
      mockData: file.replace(VIEWS_REG_EXP, (m, path, f) => `${appMocks}${f}*`),
      buildTmpl: file.replace(appViews, appBuildTmpl),
    };
    if (existsSync(filePath)) {
      jsFilesObj[filePath] = viewFiles[file];
      entryNames[filePath].isExist = true;
    }
    return jsFilesObj;
  }, {});
  const mockFiles = Object.keys(viewFiles).reduce((mockFilesObj, file) => {
    const filePath = file.replace(VIEWS_REG_EXP, (m, path, f) => `${appMocks}${f}*`);
    mockFilesObj[viewFiles[file]] = filePath;
    return mockFilesObj;
  }, {});

  console.log(viewFiles, jsFiles, mockFiles, routes, entryNames, common);
  // twigloader, entry: routes viewFiles mockFiles
  return {
    common,
    invert,
    routes,
    entryNames,
    viewFiles,
    jsFiles,
    mockFiles,
  };
};
