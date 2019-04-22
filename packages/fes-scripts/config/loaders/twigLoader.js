const glob = require('glob');
const Twig = require('twig');
const { join, parse, normalize } = require('path');

function getMap(dir, prefix) {
  const mockFiles = glob.sync(dir, {});
  const mapNameTofile = {};
  mockFiles.forEach((f) => {
    const normalizeFile = normalize(f);
    const metas = parse(normalizeFile);
    mapNameTofile[`${prefix ? `${prefix}-` : ''}${metas.name}`] = normalizeFile;
  });
  return mapNameTofile;
}

function getMockData(name, map, ctx, commonMap) {
  const REGEXP = new RegExp(`^(${name}).*`);
  const filterMap = {};
  Object.keys(map).forEach((key) => { if (REGEXP.test(key)) { filterMap[key] = map[key]; } });
  const finalMap = { ...commonMap, ...filterMap };
  const finalArr = Object.keys(finalMap);
  let result = {};

  if (finalArr.length > 0) {
    finalArr.forEach(function(key){ // eslint-disable-line
      delete require.cache[finalMap[key]];
      const item = require(finalMap[key]); // eslint-disable-line
      result = Object.assign(result, item);
      // 不能去掉，因为loader需要对其进行依赖，即使dealing with it by AddDependency plugin
      // ctx.addDependency(finalMap[key]);
    });
  }
  return result;
}


function loader(source) {
  this.addContextDependency(join(process.cwd(), 'src', 'views'));
  this.addContextDependency(join(process.cwd(), 'src', 'mock'));
  Twig.cache(false);
  this.cacheable && this.cacheable();  // eslint-disable-line
  const currentFilePath = require.resolve(this.resource);
  const currentPathInfo = parse(currentFilePath);
  const mock = join(process.cwd(), 'src', 'mock/*.+(js|json)');
  const commonMock = join(process.cwd(), 'src', 'mock/common/*.+(js|json)');

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

  const mockData = getMockData(currentPathInfo.name, getMap(mock), this, getMap(commonMock, 'common'));

  const output = template.render(mockData);
  this.callback(null, output);
}

module.exports = loader;
