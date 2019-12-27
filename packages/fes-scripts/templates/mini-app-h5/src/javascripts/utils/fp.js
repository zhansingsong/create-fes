import geturl from './geturl';

// 处理fetch对某些400,500错误不会reject
const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 400) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
};
// timeout
const timeoutPromise = delay => new Promise((res, rej) =>
  setTimeout(() => { // eslint-disable-line
    rej(new Error('fetch timeout'));
  }, delay));
// delete some properties
const deletProperties = (o, properties = []) => {
  properties.forEach((p) => {
    if (o[p]) {
      delete o[p]; // eslint-disable-line
    }
  });
  return { ...o };
};

const createFp = (defaultOptions = {
  credentials: 'include', // 默认开启fetch时发送cookie
}) => (url, params = {}, options = {}) => {
  const { timeout } = options;

  const fetchPromise = fetch(params ? geturl(url, params) : url, { ...defaultOptions, ...deletProperties(options, ['timeout']) })
    .then(checkStatus)
    .catch(error => console.log(error));

  let request = fetchPromise;

  if (timeout) {
    request = Promise.race([fetchPromise, timeoutPromise(timeout)]);
  }
  return request;
};

export default createFp();

export { createFp };
