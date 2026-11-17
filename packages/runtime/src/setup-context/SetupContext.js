/** 收集与实例共用的声明协议，保存配置结构并校验真实调用边界。 */
import { useSignal } from '@reactive-mp/reactivity/signal';
import {
  isConstructor,
  isFunction,
  isNonEmptyString,
  isNonNullObject,
  isPlainObject,
} from '@reactive-mp/shared';
import {
  componentFullLifetimeNames,
  pageLifetimeMap,
  relationTypes,
} from '../etc/constants.js';

export default class {
  runtimeContext = null;
  declarations = [];
  recordDeclaration(kind, value) {
    this.declarations.push([kind, value]);
  }
  #instance = null;
  isPage = false;
  isComponent = false;
  setupRecords = {
    options: undefined,
    exports: null,
    behaviorRefs: [],
    extClasses: [],
    props: {},
    observers: {},
    relations: new Map(),
  };
  setupLifetimes = [];
  setupPageHooks = new Map();
  setupReturns = {};

  get isSetupIdle() {
    return this.runtimeContext?.getSetupContext() !== this;
  }
  get instance() {
    return this.#instance?.deref();
  }

  constructor(configs = {}, instance) {
    Object.assign(this, configs);
    if (instance) {
      this.#instance = new WeakRef(instance);
    }
  }
  assertIsActive(action) {
    if (this.isSetupIdle) {
      throw new Error(`cannot ${action} without setup context`);
    }
  }

  addLifetimeListener(scope, lifetime, listener) {
    this.assertIsActive('add lifetime listeners');
    if (isFunction(listener)) {
      this.recordDeclaration('lifetime', lifetime);
      if (this.setupLifetimes.includes(lifetime)) {
        return true;
      }
      if (
        pageLifetimeMap.has(lifetime) ||
        componentFullLifetimeNames.includes(lifetime)
      ) {
        this.setupLifetimes.push(lifetime);
        return true;
      }
    }
    return false;
  }
  addPageEventHandle(scope, eventname, handle) {
    this.assertIsActive('add page event handle');
    if (isFunction(handle)) {
      this.recordDeclaration('pageEvent', eventname);
    }
    return false;
  }

  defineOptions(options) {
    this.assertIsActive('define options');
    this.recordDeclaration('options', options);
  }
  defineRelation(id, description) {
    this.assertIsActive('define relations');
    this.recordDeclaration('relation', [id, description]);
    const { type, linked, unlinked, linkChanged, ...options } = description;
    if (!relationTypes.includes(type)) {
      throw new TypeError(`unknown relation type: ${type}`);
    }
    this.setupRecords.relations.set(id, {
      ...options,
      type,
      handler: { linked, unlinked, linkChanged },
    });
  }

  mixInBehaviors(behaviors, ...more) {
    this.assertIsActive('mix in behaviors');
    this.recordDeclaration('behaviors', [behaviors, ...more].flat());
  }
  setProvidedData(scope, key, data) {
    this.assertIsActive('provide data');
    return false;
  }

  addExternalClasses(attrs, ...more) {
    this.assertIsActive('add external classes');
    this.recordDeclaration('externalClasses', [attrs, ...more].flat());
  }
  defineProperties(definations = {}) {
    this.assertIsActive('define properties');
    this.recordDeclaration('properties', definations);
    if (isNonNullObject(definations) === false) {
      throw new Error('properties must be a non-null object');
    }

    definations = {
      ...this.nativeProperties,
      ...this.setupRecords.props.option,
      ...definations,
    };
    const names = [],
      option = {},
      values = {};
    Object.entries(definations).forEach(([name, property]) => {
      if (
        this.instance &&
        Object.hasOwn(this.instance.properties ?? {}, name)
      ) {
        values[name] = this.instance.properties[name];
      } else {
        let type = property;
        if (isNonNullObject(property)) {
          type = property.type;
          if (Object.hasOwn(property, 'value')) {
            values[name] = property.value;
          } else if (typeof property.default === 'function') {
            values[name] = property.default();
          }
        }
        if (!Object.hasOwn(values, name)) {
          if (type === String) {
            values[name] = '';
          } else if (type === Number) {
            values[name] = 0;
          } else if (type === Boolean) {
            values[name] = false;
          } else if (type === Array) {
            values[name] = [];
          } else if (type === Object || type === null) {
            values[name] = null;
          } else {
            values[name] = undefined;
          }
        }
      }
      option[name] = property;
      names.push(name);
    });
    // 原生平台已经合并 Behavior 属性；以真实实例为准，不解析私有 Behavior 对象。
    for (const [name, value] of Object.entries(
      this.instance?.properties ?? {},
    )) {
      if (!Object.hasOwn(values, name) && !this.nativeDataKeys?.has(name)) {
        values[name] = value;
      }
    }
    this.setupRecords.props = { names, option, values };
    return values;
  }
  injectProvidedData(scope, key, defaultValue) {
    this.assertIsActive('inject provided data');
    const [signal] = useSignal(defaultValue);
    return signal;
  }
  defineExportObject(exports) {
    this.assertIsActive('define export object');
    this.recordDeclaration('export', typeof exports);
    if (isFunction(exports) || isPlainObject(exports)) {
      this.setupRecords.exports = exports;
    }
  }
  addMixedObserver(scope, src, callback) {
    this.assertIsActive('observe data or signals');
    const paths = (Array.isArray(src) ? src : [src]).filter(isNonEmptyString);
    if (paths.length) {
      this.recordDeclaration('observer', paths);
    }
    return () => false;
  }

  addPageHook(scope, name, handle) {
    if (typeof handle === 'function') {
      this.recordDeclaration('pageHook', name);
      this.setupPageHooks.set(name, handle);
    }
  }
  markPageComponent(setupReturns) {
    this.assertIsActive('mark page component');
    this.recordDeclaration('page', true);
    this.isPage = true;
    return setupReturns;
  }

  reset(configs = {}) {
    this.declarations = [];
    const { relations } = this.setupRecords;
    relations.clear();
    this.isPage = false;
    this.isComponent = false;
    this.setupRecords = {
      relations,
      options: undefined,
      exports: null,
      behaviorRefs: [],
      extClasses: [],
      props: {},
      observers: {},
    };
    this.setupLifetimes = [];
    this.setupPageHooks.clear();
    this.setupReturns = {};
    this.#instance = null;
    return Object.assign(this, configs);
  }
}
