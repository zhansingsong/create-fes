const { existsSync } = require('fs');
const {
  join, parse, sep, normalize,
} = require('path');
const glob = require('glob');

const generateFocus = (focus = '', viewFiles, appViews) => {
  const results = {};
  let focusArr = focus;
  if (!Array.isArray(focus)) {
    focusArr = [focus];
  }

  focusArr.forEach((item) => {
    let key = '';
    let ext = '.html';
    if (/\.html/.test(item)) {
      ext = '';
    }
    try {
      key = join(appViews, item + ext);
    } catch (error) {
      key = '';
    }
    if (viewFiles[key]) {
      results[key] = viewFiles[key];
    }
  });

  return Object.keys(results).length > 0 ? results : viewFiles;
};

module.exports = (routerConfig = {}, focus = '', paths, chalk) => {
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
    // check custom route exist or not
    const viewFilePath = join(appViews, file);
    if (existsSync(viewFilePath)) {
      customRoutes[viewFilePath] = routerConfig[file]; // eslint-disable-line
    } else {
      console.log(`${chalk.redBright('routerConfig[')}${chalk.dim(file)}${chalk.redBright(']=')}${chalk.dim(routerConfig[file])}${chalk.bold.redBright(' doesn\'t exist.')}`);
    }
    return customRoutes;
  }, {});
  // viewFiles
  let viewFiles = Object.assign(defaultViewFiles, customViewFiles);
  if (focus) {
    viewFiles = generateFocus(focus, viewFiles, appViews);
  }
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
