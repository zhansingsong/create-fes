export default (queryString) => {
  const REGEXP = /[<>&"'`\x00]/g; // eslint-disable-line
  const qs = queryString.length > 0 ? queryString.substring(1) : '';
  const args = {};
  const items = qs.length ? qs.split('&') : [];
  const len = items.length;
  let item = null;
  let name = null;
  let value = null;
  for (let i = 0; i < len; i++) {  // eslint-disable-line
    item = items[i].split('=');
    name = decodeURIComponent(item[0]).replace(REGEXP, '');
    value = decodeURIComponent(item[1]).replace(REGEXP, '');
    if (name.length) {
      args[name] = value;
    }
  }
  return args;
};
