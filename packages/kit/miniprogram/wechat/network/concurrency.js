/** 进行中请求复用和重复提交抑制；状态归每个包装函数，终态总会释放。 */
import { wrapNetworkError } from './errors.js';

/** 默认键适用于 JSON 参数；非 JSON 参数或身份敏感调用须提供独立 key。 */
function requestKey(args, key) {
  return key ? key(...args) : JSON.stringify(args);
}

/** 同一包装函数内，同 key 的进行中调用共享结果；不缓存已完成结果。 */
export function reusableGetter(getter, { key } = {}) {
  const pending = new Map();
  return function (...args) {
    let id;
    try {
      id = requestKey(args, key);
    } catch (error) {
      return Promise.resolve([false, wrapNetworkError(error)]);
    }
    if (pending.has(id)) {
      return pending.get(id);
    }
    const promise = Promise.resolve()
      .then(() => getter(...args))
      .catch((error) => [false, wrapNetworkError(error)])
      .finally(() => pending.delete(id));
    pending.set(id, promise);
    return promise;
  };
}

/** 并发重复调用返回 cancelled；这是进行中抑制，不是按时间防抖。 */
export function debouncedGetter(getter, strictMode = false, { key } = {}) {
  if (strictMode) {
    return debouncedSetter(getter);
  }
  const pending = new Set();
  return async function (...args) {
    let id;
    try {
      id = requestKey(args, key);
      if (pending.has(id)) {
        return [
          false,
          wrapNetworkError('Request is already in progress', 'cancelled'),
        ];
      }
      pending.add(id);
      try {
        return await getter(...args);
      } finally {
        pending.delete(id);
      }
    } catch (error) {
      return [false, wrapNetworkError(error)];
    }
  };
}

/** 包装函数内任意参数互斥；force 可选地按参数键隔离并发抑制。 */
export function debouncedSetter(setter, withForce = false) {
  let pending = false;
  const invoke = async (...args) => {
    if (pending) {
      return [
        false,
        wrapNetworkError('Request is already in progress', 'cancelled'),
      ];
    }
    pending = true;
    try {
      return await setter(...args);
    } catch (error) {
      return [false, wrapNetworkError(error)];
    } finally {
      pending = false;
    }
  };
  if (withForce) {
    invoke.force = debouncedGetter(setter);
  } else {
    invoke.force = async () => [
      false,
      wrapNetworkError('Force invocation is disabled', 'cancelled'),
    ];
  }
  return invoke;
}
