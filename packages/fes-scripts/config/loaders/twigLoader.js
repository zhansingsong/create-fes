const Twig = require('twig');
const loaderUtils = require('loader-utils');
const { join } = require('path');

function loader(source) {
  this.addContextDependency(join(process.cwd(), 'src', 'views'));
  this.addContextDependency(join(process.cwd(), 'src', 'mock'));
  const { getMockData } = loaderUtils.getOptions(this);
  Twig.cache(false);
  this.cacheable && this.cacheable();  // eslint-disable-line
  const currentFilePath = require.resolve(this.resource);

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

  const mockData = getMockData(currentFilePath);
  const output = template.render(mockData);
  this.callback(null, output);
}

module.exports = loader;
