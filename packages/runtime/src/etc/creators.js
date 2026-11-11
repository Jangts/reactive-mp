import {
  isInternalSignalCarrier,
  isSignalPayloadRef,
  useSignal,
  interpretSignal,
  isSignal,
  trackSignal,
  watch,
} from "@reactive-mp/reactivity";
import { isNonEmptyString, get } from "@reactive-mp/shared";
import { pageEventNames, pageHookNames } from "./constants.js";

/**
 * @param {SetupContext} setupCtx
 * @param {ReturnType<createInstanceLifetimeScope>} scope
 */
export function createSettingUpContext(setupCtx, scope) {
  const exposedCtx = {
    isPage: setupCtx.isPage,
    isComponent: setupCtx.isComponent,
    $this: setupCtx.instance || null,
    defineOptions: setupCtx.defineOptions.bind(setupCtx),
    behaviors: setupCtx.mixInBehaviors.bind(setupCtx),
    provide: setupCtx.setProvidedData.bind(setupCtx, scope),
    inject: setupCtx.injectProvidedData.bind(setupCtx, scope),
    observe: setupCtx.addMixedObserver.bind(setupCtx, scope),
  };
  pageEventNames.forEach((name) => {
    exposedCtx[`on${name}`] = setupCtx.addPageEventHandle.bind(setupCtx, scope, name);
  });
  if (setupCtx.isComponent) {
    exposedCtx.page = setupCtx.markPageComponent.bind(setupCtx);
    exposedCtx.$emit =
      scope?.context.instance?.triggerEvent.bind(scope?.context.instance) ||
      (() => {});
    exposedCtx.extClasses = setupCtx.addExternalClasses.bind(setupCtx);
    exposedCtx.defineRelation = setupCtx.defineRelation.bind(setupCtx);
    exposedCtx.defineProps = setupCtx.defineProperties.bind(setupCtx);
    exposedCtx.defineExpose = setupCtx.defineExportObject.bind(setupCtx);
  }
  for (const name of pageHookNames) {
    exposedCtx[`on${name}`] = setupCtx.addPageHook.bind(setupCtx, scope, name);
  }
  Object.defineProperties(exposedCtx, {
    isSettingUpOptions: { value: !scope },
    isSettingUpInstance: { value: !!scope },
  });
  return Object.freeze(exposedCtx);
}

/**
 *
 * @param {object} instance - 页面或组件实例
 * @returns
 */
export function createDataBinder(instance) {
  let isSyncing = false;
  let active = false;
  const signals = {};
  let pendingData = {};
  const unbinds = [];

  const instanceSetData = instance.setData.bind(instance);
  const updateData = (key, val) => {
    if (!active || isSyncing) pendingData[key] = val;
    else instanceSetData({ [key]: val });
  };
  const bind = (name, signal) => {
    signals[name] = signal;
    unbinds.push(
      trackSignal(signal, (payload) => updateData(name, payload.value))
    );
  };
  const sync = (dataKey) => {
    try {
      isSyncing = true;
      const signal = signals[dataKey];
      if (!signal) return;
      if (isInternalSignalCarrier(signal)) {
        if (isSignalPayloadRef(signal)) {
          signal.value = instance.data[dataKey];
        } else Object.assign(signal, instance.data[dataKey]);
      } else useSignal(signal)?.[1]?.(instance.data[dataKey]);
    } catch (error) {
      throw error;
    } finally {
      isSyncing = false;
      if (Object.keys(pendingData).length) {
        const data = pendingData;
        pendingData = {};
        instanceSetData(data);
      }
    }
  };

  const setData = (data, callback) => {
    if (data && typeof data === "object") {
      instanceSetData(data, () => {
        Object.keys(data).forEach((key) => sync(key.split(/[.\[]/)[0]));
        callback?.();
      });
    }
  };

  const activate = (initialData) => {
    if (active) return;
    active = true;
    const data = { ...initialData, ...pendingData };
    pendingData = {};
    if (Object.keys(data).length) instanceSetData(data);
  };
  return { setData, bind, unbinds, activate };
}

/**
 * @typedef {object} CreateMixedObserverContext
 * @property {object} instance - 页面或组件实例
 * @property {string} key - Data Observer 标识
 * @property {Array<()=>any|Record<string,any>>} signals - 信号
 * @property {Map<string|()=>any|Record<string,any>, number>} indexesMap - 索引字典
 */

/**
 * @param {string|()=>any|Record<string,any>|Array<string|()=>any|Record<string,any>>} src
 * @param {(...values:any[])=>void} observer
 * @param {CreateMixedObserverContext} ctx
 * @returns
 */
export function createMixedObserver(
  src,
  observer,
  { instance, eventBus, key, signals, indexesMap }
) {
  const instanceDataObserver = ({ payload }) => {
    observer.call(
      instance,
      ...src.map((s) => {
        if (isSignal(s)) return interpretSignal(s, true);
        if (isNonEmptyString(s)) return payload[indexesMap.get(s)];
        return s;
      })
    );
  };
  const signalsObserver = (values) => {
    observer.call(
      instance,
      ...src.map((s) => {
        if (isSignal(s)) return values[indexesMap.get(s)];
        if (isNonEmptyString(s)) return get(instance.data, s);
        return undefined;
      })
    );
  };
  const unobserve = eventBus.on(
    `datachange/${key}`,
    instanceDataObserver
  );
  const unwatch = watch(signals, signalsObserver).stop;
  return () => (unobserve(), unwatch());
}
