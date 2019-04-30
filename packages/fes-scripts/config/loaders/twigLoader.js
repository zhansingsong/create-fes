const glob = require('glob');
const Twig = require('twig');
const loaderUtils = require('loader-utils');
const { join, parse, normalize } = require('path');

function getMap(dir, prefix) {
  if (!dir) {
    return {};
  }
  const mockFiles = glob.sync(dir, {});
  const mapNameTofile = {};
  mockFiles.forEach((f) => {
    const normalizeFile = normalize(f);
    const metas = parse(normalizeFile);
    mapNameTofile[`${prefix ? `${prefix}-` : ''}${metas.name}`] = normalizeFile;
  });
  return mapNameTofile;
}

function getMockData(map, commonMap) {
  const finalMap = { ...commonMap, ...map };
  const finalArr = Object.keys(finalMap);
  let result = {};

  if (finalArr.length > 0) {
    finalArr.forEach(function(key){ // eslint-disable-line
      delete require.cache[finalMap[key]];
      const item = require(finalMap[key]); // eslint-disable-line
      result = Object.assign(result, item);
    });
  }
  return result;
}


function loader(source) {
  this.addContextDependency(join(process.cwd(), 'src', 'views'));
  this.addContextDependency(join(process.cwd(), 'src', 'mock'));
  const { viewFiles, mockFiles } = loaderUtils.getOptions(this).fesMap;
  Twig.cache(false);
  this.cacheable && this.cacheable();  // eslint-disable-line
  const currentFilePath = require.resolve(this.resource);
  // const currentFilePath = loaderUtils.getRemainingRequest(this);
  // const currentPathInfo = parse(currentFilePath);
  const commonMock = join(process.cwd(), 'src', 'mocks/common/*.+(js|json)');

  const template = Twig.twig({
    // id: id, // id is optional, but useful for referencing the template later
    data: source,
    allowInlineIncludes: true,
    path: currentFilePath,
  });

  // 去掉缓存
  Twig.extend((T) => {
    if (T.Templates && T.Templates.registry) {
      T.Templates.registry = {}; // eslint-disable-line
    }
  });

  const mockData = getMockData(getMap(mockFiles[viewFiles[currentFilePath]]), getMap(commonMock, 'common'));
  const output = template.render(mockData);
  this.callback(null, output);
}

module.exports = loader;
