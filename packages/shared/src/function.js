/** 函数组合与微任务调度工具，不持有页面或组件状态。 */
import { isArray, isFunction } from './type.js';

/**
 * @template {unknown} T
 * @template {any[]} A1
 * @template {any[]} A2
 * @param {(...args: Array<unknown>) => unknown[]} callbacks
 * @param {T} [thisArg=null]
 * @param  {A1} bindArgs
 * @returns {(...args: A2) => T}
 */
export function mergeCallbacks(callbacks, thisArg = null, ...bindArgs) {
  return (...args) => {
    isArray(callbacks) &&
      callbacks
        .filter(isFunction)
        .forEach((callback) => callback.call(thisArg, ...bindArgs, ...args));
    return thisArg;
  };
}

/**
 * @template {unknown} T
 * @template {unknown[]} A
 * @param {(...args: A) => T} fn
 * @param {string} msg
 * @returns {(...args: A) => T}
 */
export function onceInvokable(fn, msg) {
  let invoked = false;
  return function (...args) {
    if (invoked) {
      throw new Error(msg);
    }
    invoked = true;
    return fn.call(this, ...args);
  };
}

/**
 * scheduleMicrotask
 *
 * 优先使用 queueMicrotask，否则降级到 Promise
 */
export const scheduleMicrotask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (task) => Promise.resolve().then(task);

/**
 * @template {unknown[]} T
 * @param {(...args: T) => void} fn
 * @param {(...args: T) => void} onTrigger
 * @returns {(...args: T) => void}
 */
export const debounceMicrotask = (fn, onTrigger) => {
  let pending = false;
  let latestArgs;

  return function (...args) {
    latestArgs = args;
    onTrigger?.(...args);

    if (!pending) {
      pending = true;
      scheduleMicrotask(() => {
        const applyArgs = latestArgs;
        latestArgs = undefined;
        pending = false;
        fn(...applyArgs);
      });
    }
  };
};
