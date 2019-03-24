const glob = require('glob');
const Twig = require('twig');
const { join, parse, normalize } = require('path');
// import hashGenerator from 'hasha';

function addDependencies(dir, callback) {
  const mockFiles = glob.sync(dir, {});
  const mapNameTofile = {};
  mockFiles.forEach((f) => {
    const normalizeFile = normalize(f);
    const metas = parse(normalizeFile);
    callback(normalizeFile);
    mapNameTofile[metas.name] = normalizeFile;
  });
  return mapNameTofile;
}

function getMockData(name, map, ctx) {
  const REGEXP = new RegExp(`^(${name}).*`);
  const filterArr = Object.keys(map).filter(key => REGEXP.test(key));
  let result = {};

  if (filterArr.length > 0) {
    filterArr.forEach(function(key){ // eslint-disable-line
      const item = require(map[key]); // eslint-disable-line
      result = Object.assign(result, item);
      delete require.cache[map[key]];
      // 不能去掉，因为loader需要对其进行依赖，即使dealing with it by AddDependency plugin
      ctx.addDependency(map[key]);
    });
  }
  return result;
}

function loader(source) {
  Twig.cache(false);
  this.cacheable && this.cacheable();
  const currentFilePath = require.resolve(this.resource);
  const currentPathInfo = parse(currentFilePath);
  const mock = join(process.cwd(), 'src', 'mock/*.+(js|json)');
  const twigTmpl = join(process.cwd(), 'src', 'views/**/**.html');
  addDependencies(twigTmpl, this.addDependency);
  const mapNameTofile = addDependencies(mock, this.addDependency);
  const template = Twig.twig({
    // id: id, // id is optional, but useful for referencing the template later
    data: source,
    allowInlineIncludes: true,
    path: currentFilePath,
  });

  // 去掉缓存
  Twig.extend((T) => {
    if (T.Templates && T.Templates.registry) {
      T.Templates.registry = {};
    }
  });

  const mockData = getMockData(currentPathInfo.name, mapNameTofile, this);

  const output = template.render(mockData);
  this.callback(null, output);
}

module.exports = loader;
