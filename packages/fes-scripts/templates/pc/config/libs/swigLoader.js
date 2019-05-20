/**
 * usage:
 * npm install swig loader-utils -D
 */
/* eslint-disable */
const swig = require('swig');
const loaderUtils = require('loader-utils');
const { join } = require('path');

swig.setDefaults({ cache: false });

function loader(source) {
  this.addContextDependency(join(process.cwd(), 'src', 'views'));
  this.addContextDependency(join(process.cwd(), 'src', 'mock'));
  const { getMockData } = loaderUtils.getOptions(this);
  this.cacheable && this.cacheable();  // eslint-disable-line
  const currentFilePath = require.resolve(this.resource);
  const mockData = getMockData(currentFilePath);
  const output = swig.compileFile(currentFilePath)(mockData);
  this.callback(null, output);
}

module.exports = loader;
