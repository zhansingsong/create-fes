const glob = require('glob');
const { parse, normalize } = require('path');
const fetch = require('node-fetch');

global.fes_mock_data = {};

/**
 * get mock data by specific path of view file
 */
module.exports = (paths, mockConfig) => {
  const { viewFiles, mockFiles, common } = paths.fesMap;

  function getMap(dir, prefix, isArray) {
    if (!dir) {
      return {};
    }
    const mocks = glob.sync(dir, {});
    if (isArray) {
      return mocks;
    }
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
        delete require.cache[finalMap[key]];
        const item = require(finalMap[key]); // eslint-disable-line
        result = Object.assign(result, item);
      });
    }
    return result;
  }

  function getApiData(url, callback) {
    const isCallback = typeof callback === 'function';
    const key = isCallback ? viewFiles[url] : url;
    const mockApi = mockConfig[key];
    const mockData = getMockData(getMap(mockFiles[key]), getMap(common.mock, 'common'));
    let finalData = mockData;
    global.fes_mock_data[key] = finalData;

    if (mockApi) {
      return fetch(mockApi.api)
        .then(res => res.json())
        .then((data) => {
          let tempData = data;
          if (typeof mockApi.format === 'function') {
            tempData = mockApi.format(data) || {};
          }
          finalData = Object.assign(
            {},
            tempData,
            mockData,
          );
          isCallback && callback(finalData); // eslint-disable-line
          global.fes_mock_data[key] = finalData;
          return finalData;
        })
        .catch((err) => {
          console.error(err);
          process.exit(1);
        });
    }
    isCallback && callback(finalData); // eslint-disable-line
    return Promise.resolve(finalData);
  }

  // return url => getMockData(getMap(mockFiles[viewFiles[url]]), getMap(common.mock, 'common'));
  return (url, callback) => getApiData(url, callback);
};
