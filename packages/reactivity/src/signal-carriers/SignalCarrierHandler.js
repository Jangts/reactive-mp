/** 只读、可写与嵌套对象的 Proxy 操作，保留合法假值及原型接收者。 */
import { hasOwnProp } from '@reactive-mp/shared';

export class SignalCarrierHandler {
  __signal = null;
  __visitors = null;
  __emit = null;

  constructor({ signal, visitors, emit }) {
    this.__signal = signal;
    this.__visitors = visitors || {};
    this.__emit = emit;
  }
  get(t, p, r) {
    if (hasOwnProp(t, p)) {
      const value = this.__signal()[p];
      return this.__visitors.Reading
        ? this.__visitors.Reading([p, value])
        : value;
    }
    return Reflect.get(t, p, r);
  }
  set(t, p, v, r) {
    return false;
  }
  deleteProperty(t, p, r) {
    return false;
  }
}

export class MutableSignalCarrierHandler extends SignalCarrierHandler {
  set(t, p, v, r) {
    if (this.__visitors?.Assignment?.([p, v])) {
      this.__emit();
    }
    return true;
  }
}

export class NestedSignalCarrierHandler extends SignalCarrierHandler {
  set(t, p, v, r) {
    if (v === t[p]) {
      return true;
    }
    const untracked = hasOwnProp(t, p)
      ? this.__visitors?.Replacement?.([p, t[p]])
      : false;
    const value = this.__visitors.Assignment
      ? this.__visitors.Assignment([p, v])
      : v;
    Object.defineProperty(t, p, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    this.__emit(untracked);
    return true;
  }
  deleteProperty(t, p, r) {
    if (hasOwnProp(t, p)) {
      this.__visitors?.Deletion?.([p, t[p]]);
      delete t[p];
      this.__emit(true);
      return true;
    }
    return true;
  }
}
