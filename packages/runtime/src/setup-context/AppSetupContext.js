/** App 的一次性 setup 上下文：组合生命周期与原生配置，持有应用级状态。 */
import { interpretSignal, isSignal } from '@reactive-mp/reactivity';
import { emitSignal } from '@reactive-mp/reactivity/signal';
import { appLifetimeMap } from '../etc/constants.js';

export default class AppSetupContext {
  isApp = true;
  isPage = false;
  isComponent = false;
  instance = null;
  setupRecords = {};
  #listeners = new Map();

  /** 登记应用生命周期；不把 App show/hide 误发给页面或组件。 */
  addLifetimeListener(scope, lifetime, listener) {
    const name = appLifetimeMap.get(lifetime);
    if (!name) {
      throw Error(`unsupported App lifecycle: ${lifetime}`);
    }
    if (typeof listener !== 'function') {
      throw new TypeError('App lifecycle handler must be a function');
    }
    const listeners = this.#listeners.get(name) ?? [];
    listeners.push(listener);
    this.#listeners.set(name, listeners);
    return true;
  }

  /** 将原生 globalData 与 setup 状态合并；读取 Signal 值，保留应用动作接收者。 */
  formatDataAndMethods(native = {}) {
    const { globalData: original = {}, ...methods } = native;
    const values = { ...original };
    const signals = new Map();
    for (const [key, record] of Object.entries(this.setupRecords)) {
      if (isSignal(record)) {
        signals.set(key, record);
      } else if (typeof record === 'function') {
        methods[key] = record;
      } else {
        Object.defineProperty(values, key, {
          value: record,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
    }
    const globalData = new Proxy(values, {
      get(target, key, receiver) {
        if (signals.has(key)) {
          return interpretSignal(signals.get(key), true);
        }
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value) {
        if (signals.has(key)) {
          if (!emitSignal(signals.get(key), { value })) {
            throw new TypeError(`App state ${String(key)} is readonly`);
          }
          return true;
        }
        Object.defineProperty(target, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
        return true;
      },
      ownKeys(target) {
        return [...new Set([...Reflect.ownKeys(target), ...signals.keys()])];
      },
      getOwnPropertyDescriptor(target, key) {
        if (signals.has(key)) {
          return {
            configurable: true,
            enumerable: true,
            value: interpretSignal(signals.get(key), true),
            writable: true,
          };
        }
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      deleteProperty(target, key) {
        if (signals.has(key)) {
          return false;
        }
        return Reflect.deleteProperty(target, key);
      },
    });
    for (const name of new Set([
      ...appLifetimeMap.values(),
      ...this.#listeners.keys(),
    ])) {
      const nativeHandler = native[name];
      const setupHandler =
        methods[name] !== nativeHandler ? methods[name] : undefined;
      const listeners = this.#listeners.get(name) ?? [];
      if (!nativeHandler && !setupHandler && !listeners.length) {
        continue;
      }
      methods[name] = function (...args) {
        nativeHandler?.apply(this, args);
        setupHandler?.apply(this, args);
        for (const listener of listeners) {
          listener.apply(this, args);
        }
      };
    }
    return { globalData, setupMethods: methods };
  }
}
