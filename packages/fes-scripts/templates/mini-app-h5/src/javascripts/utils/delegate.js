export default fn => (event) => {
  let { target, currentTarget } = event; // eslint-disable-line
  while (target !== currentTarget) {
    if (fn.call(null, target, event)) {
      return;
    }
    target = target.parentNode;
  }
};
