const innerStore = {};
const triggerStore = {};
export const watch = (obj, key, value, descriptor) => {
  innerStore[key] = value;
  triggerStore[key] = value;

  Object.defineProperty(
    obj,
    key,
    Object.assign({}, descriptor, {
      set(value) {  // eslint-disable-line
        descriptor.set(value, innerStore);
      },
      get() {
        console.log(innerStore);
        // 坑死我呀，返回总是undefined
        return descriptor.get(innerStore);
      },
    })
  );
  Object.defineProperty(
    triggerStore,
    key,
    Object.assign({}, descriptor, {
      set(value) {  // eslint-disable-line
        obj[key] = value;
      },
      get() {
        return innerStore[key];
      },
    })
  );
};
export const trigger = (key, value) => (triggerStore[key], (triggerStore[key] = value)); // eslint-disable-line

export default watch;
