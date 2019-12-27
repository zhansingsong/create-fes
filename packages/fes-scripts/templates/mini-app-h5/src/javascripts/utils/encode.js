export default (s) => {
	const encReg = /[\W_]/g; // eslint-disable-line
  return (s == null ? '' : `${s}`).replace(encReg, '');
};
