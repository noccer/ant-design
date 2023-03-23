import raf from 'raf';
export default function throttleByAnimationFrame(fn) {
  let requestId;
  const later = args => () => {
    requestId = null;
    fn(...args);
  };
  const throttled = (...args) => {
    if (requestId == null) {
      requestId = raf(later(args));
    }
  };
  throttled.cancel = () => raf.cancel(requestId);
  return throttled;
}
export function throttleByAnimationFrameDecorator() {
  // eslint-disable-next-line func-names
  return function(target, key, descriptor) {
    const fn = descriptor.value;
    let definingProperty = false;
    return {
      configurable: true,
      get() {
        // eslint-disable-next-line no-prototype-builtins
        if (definingProperty || this === target.prototype || this.hasOwnProperty(key)) {
          return fn;
        }
        const boundFn = throttleByAnimationFrame(fn.bind(this));
        definingProperty = true;
        Object.defineProperty(this, key, {
          value: boundFn,
          configurable: true,
          writable: true,
        });
        definingProperty = false;
        return boundFn;
      },
    };
  };
}
