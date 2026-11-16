/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
import { CombinedError } from '@reactive-mp/shared';
import {
  createEffectScope,
  isSignal,
  isRunInEffectFreeScope,
} from '@reactive-mp/reactivity';

// A definition owns a lazy singleton. Collection gets an isolated, effect-free
// shape; it must never initialize the shared instance or start its effects.
export function defineStore(id, setup) {
  if (typeof setup !== 'function') {
    throw new TypeError('store setup must be a function');
  }
  let current;
  let scope;
  function create() {
    const result = setup() ?? {};
    if (
      typeof result !== 'object' ||
      result === null ||
      typeof result.then === 'function'
    ) {
      throw new TypeError('store setup must synchronously return an object');
    }
    const methods = new WeakMap();
    return new Proxy(result, {
      get(target, key) {
        if (key === '$id') {
          return id;
        }
        if (key === '$dispose') {
          return dispose;
        }
        const value = Reflect.get(target, key, target);
        if (typeof value !== 'function' || isSignal(value)) {
          return value;
        }
        if (!methods.has(value)) {
          methods.set(value, value.bind(target));
        }
        return methods.get(value);
      },
    });
  }
  function dispose() {
    const previousScope = scope;
    scope = undefined;
    current = undefined;
    previousScope?.stop();
  }
  function useStore() {
    if (isRunInEffectFreeScope()) {
      return create();
    }
    if (!current) {
      scope = createEffectScope(true);
      try {
        current = scope.run(create);
      } catch (error) {
        try {
          dispose();
        } catch (cleanupError) {
          throw new CombinedError(
            [error, cleanupError],
            'store creation and cleanup failed',
          );
        }
        throw error;
      }
    }
    return current;
  }
  useStore.dispose = dispose;
  return useStore;
}
export function storeToRefs(store) {
  return Object.fromEntries(
    Object.entries(store).filter(([, value]) => isSignal(value)),
  );
}
export default defineStore;
