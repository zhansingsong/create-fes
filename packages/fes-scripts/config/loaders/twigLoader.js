const Twig = require('twig');
const loaderUtils = require('loader-utils');
const { join } = require('path');

function loader() {
  // async
  const callback = this.async();
  this.addContextDependency(join(process.cwd(), 'src', 'views'));
  this.addContextDependency(join(process.cwd(), 'src', 'mock'));
  const { getMockData, ...others } = loaderUtils.getOptions(this);
  Twig.cache(false);
  this.cacheable && this.cacheable();  // eslint-disable-line
  const currentFilePath = require.resolve(this.resource);
  /**
   * not use source, but use path. so as to support base dir.
   * 为了与后端保持一致，开启 base，开启绝对路径的使用
   */
  const template = Twig.twig({
    id: currentFilePath, // id is optional, but useful for referencing the template later
    base: join(process.cwd(), 'src', 'views'),
    // data: source,
    // allowInlineIncludes: true,
    async: false,
    path: currentFilePath,
    ...others,
  });
  // 使用data参数时，base会被过滤掉
  // template.base = join(process.cwd(), 'src', 'views');
  // 去掉缓存
  Twig.extend((T) => {
    if (T.Templates && T.Templates.registry) {
      T.Templates.registry = {}; // eslint-disable-line
    }
  });
  // 异步调用
  // 由于使用异步调用所有不能使用相对路径，需要使用绝对路径。
  getMockData(currentFilePath, (mockData) => {
    const output = template.render(mockData);
    callback(null, output);
  });
}

module.exports = loader;
