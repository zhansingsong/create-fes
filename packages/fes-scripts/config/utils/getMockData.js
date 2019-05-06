const glob = require('glob');
const { parse, normalize } = require('path');

/**
 * get mock data by specific path of view file
 */
module.exports = (paths) => {
  const { viewFiles, mockFiles, common } = paths.fesMap;

  function getMap(dir, prefix) {
    if (!dir) {
      return {};
    }
    const mocks = glob.sync(dir, {});
    const mapNameTofile = {};
    mocks.forEach((f) => {
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
      finalArr.forEach((key) => {
        // eslint-disable-line
        delete require.cache[finalMap[key]];
        const item = require(finalMap[key]); // eslint-disable-line
        result = Object.assign(result, item);
      });
    }
    return result;
  }

  return url => getMockData(getMap(mockFiles[viewFiles[url]]), getMap(common.mock, 'common'));
};
