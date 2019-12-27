export default (url, params) => {
  let tempUrl = url;
  const paramsArray = [];
  Object.keys(params).forEach(key => paramsArray.push(`${key}=${encodeURIComponent(params[key])}`));
  if (url.search(/\?/) === -1) {
    tempUrl += `?${paramsArray.join('&')}`;
  } else {
    tempUrl += `&${paramsArray.join('&')}`;
  }
  return tempUrl;
};
