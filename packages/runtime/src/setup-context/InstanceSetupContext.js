/** 实例阶段的声明处理器：拥有方法、props、注入、事件及视图绑定。 */
import {
  computed,
  isSignal,
  isWatchable,
  trackSignal,
  signalized,
  useSignal,
  interpretSignal,
  watch,
} from '@reactive-mp/reactivity';
import { SignalCarrier } from '@reactive-mp/reactivity/signal-carriers/carriers';
import { protectSignal } from '@reactive-mp/reactivity/signal';
import {
  EventBus,
  isFunction,
  isNonEmptyString,
  isPlainObject,
  isSymbol,
} from '@reactive-mp/shared';
import {
  componentLifetimeNames,
  componentPageLifetimeNames,
  onceLifetimeNames,
  pageEventNames,
  pageLifetimeMap,
} from '../etc/constants.js';
import { createDataBinder } from '../etc/data-binding.js';
import { snapshotPropValue, matchesPropValue } from '../etc/prop-values.js';
import { createMixedObserver } from '../etc/creators.js';
import { formatObserveSource } from '../etc/formatters.js';
import SetupContext from './SetupContext.js';

class SetupProps extends SignalCarrier {}
const crossInstanceEventBus = new EventBus();

export default class extends SetupContext {
  eventBus = new EventBus();
  activateView = () => {};
  deactivateView = () => {};
  setupProps = {
    defined: false,
    signal: null,
    assign: null,
  };
  providedData = new Map();
  setupMethods = new Map();
  relationHandlers = new Map();

  addLifetimeListener(scope, lifetime, listener) {
    if (super.addLifetimeListener(scope, lifetime, listener)) {
      const listenType = onceLifetimeNames.includes(lifetime) ? 'once' : 'on';
      scope[listenType](`lifetimes/${lifetime}`, ({ payload }) =>
        listener.call(this.instance, ...payload),
      );
      return true;
    }
    return false;
  }
  addPageEventHandle(scope, eventname, handle) {
    super.addPageEventHandle(scope, eventname, handle);
    if (pageEventNames.includes(eventname) && isFunction(handle)) {
      scope.addLifetimeHandle(
        'dispose',
        crossInstanceEventBus.on(
          `${scope.pageId}/events/${eventname}`,
          ({ payload }) => handle.call(this.instance, ...payload),
        ),
      );
      return true;
    }
    return false;
  }

  defineRelation(id, description) {
    super.defineRelation(id, description);
    const { handler } = this.setupRecords.relations.get(id) || {};
    if (handler) {
      Object.entries(handler).forEach(([eventname, handle]) => {
        if (isFunction(handle)) {
          let handleMap = this.relationHandlers.get(id);
          if (!handleMap) {
            handleMap = {};
            this.relationHandlers.set(id, handleMap);
          }
          handleMap[eventname] = handle;
        }
      });
    }
  }
  setProvidedData(scope, key, data) {
    super.setProvidedData(scope, key, data);
    if (this.providedData && (isNonEmptyString(key) || isSymbol(key))) {
      if (isFunction(data) && !isSignal(data)) {
        data = computed(data);
      }
      this.providedData.set(key, { data });
      return true;
    }
    return false;
  }

  defineProperties(definations = {}) {
    const values = super.defineProperties(definations);
    this.setupProps.lastSnapshots = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        snapshotPropValue(value),
      ]),
    );
    if (this.setupProps.signal) {
      this.setupProps.assign(values);
      return this.setupProps.signal;
    }
    const [signal, assign] = signalized(values, SetupProps);
    this.setupProps.signal = signal;
    this.setupProps.assign = assign;
    this.setupProps.defined = true;
    return signal;
  }
  injectProvidedData(scope, key, defaultValue) {
    const signal = super.injectProvidedData(scope, key, defaultValue);
    const [_, set] = useSignal(signal);
    protectSignal(signal);
    if (isNonEmptyString(key) || isSymbol(key)) {
      scope.addLifetimeHandle('beforemounted', () =>
        this.bindProvidedData(scope, key, set),
      );
    }
    return signal;
  }
  addMixedObserver(scope, src, callback) {
    super.addMixedObserver(scope, src, callback);
    if (isFunction(callback)) {
      const { source, key, signals, indexesMap } = formatObserveSource(
        src,
        scope,
      );
      if (key) {
        if (signals.length) {
          // 组合字符串和signals的
          // 难点在于回调值的按序合并
          const stop = createMixedObserver(source, callback, {
            instance: this.instance,
            eventBus: this.eventBus,
            key,
            signals,
            indexesMap,
          });
          scope.addLifetimeHandle('dispose', stop);
          return stop;
        }
        const stop = this.eventBus.on(`datachange/${key}`, ({ payload }) =>
          callback.call(this.instance, ...payload),
        );
        scope.addLifetimeHandle('dispose', stop);
        return stop;
      }
      if (signals.length) {
        return watch(signals, (v) => callback(...v)).stop;
      }
    }
    return () => false;
  }

  bindSignalsAndMethods() {
    this.assertIsActive('bind signals and methods');
    const { instance, setupReturns, setupMethods } = this;
    const { setData, bind, activate, dispose } = createDataBinder(
      instance,
      this.nativeOptions?.pureDataPattern,
    );
    const data = {};
    Object.entries(setupReturns).forEach(([name, item]) => {
      if (isFunction(item)) {
        if (isSignal(item, true)) {
          if (isWatchable(item)) {
            bind(name, item);
          }
        } else {
          setupMethods?.set(name, item);
        }
      } else if (isWatchable(item)) {
        bind(name, item);
      }
      if (isSignal(item)) {
        data[name] = interpretSignal(item, true);
      } else if (!isFunction(item)) {
        data[name] = item;
      }
    });
    this.activateView = () => activate(data);
    this.deactivateView = dispose;
    instance.setData = setData;
    return [dispose];
  }
  mountPageLifetimeHandles(scope, options) {
    this.assertIsActive('mount page lifetime handles');
    const { instance } = this;
    pageLifetimeMap.forEach(([handleName, replace], lifetime) => {
      this.addLifetimeListener(scope, lifetime, options[handleName]);
      if (replace) {
        instance[handleName] = scope.forwardInstanceLifetimeEvent.bind(
          scope,
          lifetime,
        );
      }
    });
    return this;
  }
  mountPageEventHandle(scope, options) {
    this.assertIsActive('mount page event handles');
    pageEventNames.forEach((eventname) => {
      const handleName = `on${eventname}`;
      this.addPageEventHandle(scope, eventname, options[handleName]);
      this.instance[handleName] = this.forwardPageEvent.bind(
        this,
        scope,
        eventname,
      );
    });
    return this;
  }
  registerComponentLifetimeListener(scope, options) {
    this.assertIsActive('register component lifetime listeners');
    new Set([
      ...this.setupLifetimes,
      ...Object.keys(options.lifetimes || {}),
      ...Object.keys(options.pageLifetimes || {}),
      ...componentLifetimeNames.filter((name) => isFunction(options[name])),
    ]).forEach((lifetime) => {
      let optHandler;
      if (componentLifetimeNames.includes(lifetime)) {
        optHandler = options.lifetimes?.[lifetime] || options[lifetime];
      } else if (componentPageLifetimeNames.includes(lifetime)) {
        optHandler = options.pageLifetimes?.[lifetime];
      } else {
        return;
      }
      this.addLifetimeListener(scope, lifetime, optHandler);
    });
    return this;
  }

  bindProvidedData(scope, key, onData) {
    const data = scope.getAncestorProvidedData(
      key,
      this.runtimeContext.getPageScope.bind(this.runtimeContext),
    );

    if (data) {
      if (isSignal(data.data)) {
        if (isWatchable(data.data)) {
          scope.addLifetimeHandle(
            'dispose',
            trackSignal(data.data, ({ value }) => onData(value)),
          );
        }
        onData(interpretSignal(data.data, true));
      } else {
        onData(data.data);
      }
    }
    return this;
  }
  getProvidedData(key) {
    return this.providedData?.get(key) || null;
  }

  forwardPageEvent(scope, eventname, ...payload) {
    crossInstanceEventBus.emit(`${scope.pageId}/events/${eventname}`, payload);
    return this;
  }
  forwardRelationEvent(relationid, eventname, ...args) {
    return this.relationHandlers
      ?.get(relationid)
      ?.[eventname]?.call(this.instance, ...args);
  }
  forwardDataChangeEvent(src, ...values) {
    this.eventBus.emit(`datachange/${src}`, values);
    return this;
  }
  syncSetupPropValues(values) {
    const { defined, assign } = this.setupProps;
    if (defined && assign) {
      // Native Component.properties aliases data, including generated view fields.
      // Only inputs discovered by defineProps belong to the reactive props carrier.
      const inputs = {};
      for (const name of Object.keys(this.setupRecords.props.values)) {
        if (!Object.hasOwn(values, name)) {
          continue;
        }
        const value = values[name];
        if (!matchesPropValue(value, this.setupProps.lastSnapshots[name])) {
          inputs[name] = value;
          this.setupProps.lastSnapshots[name] = snapshotPropValue(value);
        }
      }
      if (Object.keys(inputs).length) {
        assign(inputs);
      }
    }
  }
  invokePageHook(name, fallback, ...args) {
    const handle =
      this.setupPageHooks.get(name) ||
      this.setupMethods.get(`on${name}`) ||
      fallback;
    return handle?.apply(this.instance, args);
  }
  invokeSetupMethod(methodname, ...args) {
    return this.setupMethods?.get(methodname)?.call(this.instance, ...args);
  }
  onExpose() {
    const exports = this.setupRecords.exports;
    const value = isFunction(exports) ? exports.call(this.instance) : exports;
    if (value !== null && typeof value === 'object') {
      this.runtimeContext.setComponentScope(
        value,
        this.runtimeContext.getComponentScope(this.instance),
      );
      return value;
    }
  }

  reset(configs = {}) {
    const pageId = this.instance.getPageId();
    if (pageId && this.isPage) {
      crossInstanceEventBus.offNamespace(pageId);
    }
    this.eventBus.clear();
    this.providedData.clear();
    this.setupMethods.clear();
    this.relationHandlers.clear();
    this.setupProps = {
      defined: false,
      signal: null,
      assign: null,
    };
    this.eventBus = null;
    this.providedData = null;
    this.setupMethods = null;
    this.relationHandlers = null;
    super.reset(configs);
  }
}
