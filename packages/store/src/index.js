import {
  createEffectScope, isSignal, isRunInEffectFreeScope,
} from '@reactive-mp/reactivity';

// A definition owns a lazy singleton. Collection gets an isolated, effect-free
// shape; it must never initialize the shared instance or start its effects.
export function defineStore(id, setup) {
  if (typeof setup !== 'function') throw new TypeError('store setup must be a function');
  let current;
  let scope;
  function create() {
    const result = setup() || {};
    return new Proxy(result, {
      get(target, key) {
        if (key === '$id') return id;
        if (key === '$dispose') return dispose;
        return Reflect.get(target, key);
      },
    });
  }
  function dispose() {
    scope?.stop();
    scope = undefined;
    current = undefined;
  }
  function useStore() {
    if (isRunInEffectFreeScope()) return create();
    if (!current) {
      scope = createEffectScope(true);
      try { current = scope.run(create); }
      catch (error) { dispose(); throw error; }
    }
    return current;
  }
  useStore.dispose = dispose;
  return useStore;
}
export function storeToRefs(store) {
  return Object.fromEntries(Object.entries(store).filter(([, value]) => isSignal(value)));
}
export default defineStore;
