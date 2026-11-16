/** 将实例状态与原生 setData 连接；逻辑同步不等待视图渲染回调。 */
import { replaceShallowCarrierData } from '@reactive-mp/reactivity/signal-carriers/carriers';
import {
  interpretSignal,
  isInternalSignalCarrier,
  isSignalPayloadRef,
  trackSignal,
  useSignal,
} from '@reactive-mp/reactivity';

/** 复制视图数据以避免原生 data 与业务对象共用引用；循环和不可序列化值就近报错。 */
export function snapshotViewData(value, ancestors = new Set()) {
  if (value === null || typeof value !== 'object') {
    if (
      typeof value === 'function' ||
      typeof value === 'symbol' ||
      typeof value === 'bigint'
    ) {
      throw new TypeError('view data must be serializable');
    }
    return value;
  }
  if (ancestors.has(value)) {
    throw new TypeError('view data must not contain cycles');
  }
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((item) => snapshotViewData(item, ancestors));
    }
    if (value instanceof Date) {
      return value.toJSON();
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        snapshotViewData(item, ancestors),
      ]),
    );
  } finally {
    ancestors.delete(value);
  }
}

/**
 * 创建实例绑定。activate 在 attached 首次交付数据；dispose 禁止所有迟到视图写入。
 * @param {object} instance 原生实例，必须提供 setData/data。
 * @param {RegExp} [pureDataPattern] 只保留在逻辑层的数据字段。
 * @returns {object} 绑定、激活、清理与原生 setData 包装。
 */
export function createDataBinder(instance, pureDataPattern) {
  let syncing = false;
  let active = false;
  let disposed = false;
  let pending = Object.create(null);
  const signals = new Map();
  const unbinds = [];
  const nativeSetData = instance.setData.bind(instance);
  const isPure = (key) => {
    if (!(pureDataPattern instanceof RegExp)) {
      return false;
    }
    pureDataPattern.lastIndex = 0;
    return pureDataPattern.test(key);
  };
  const updateData = (key, value) => {
    if (disposed) {
      return;
    }
    if (isPure(key)) {
      instance.data[key] = value;
      return;
    }
    const snapshot = snapshotViewData(value);
    if (!active || syncing) {
      pending[key] = snapshot;
    } else {
      nativeSetData({ [key]: snapshot });
    }
  };
  const flush = () => {
    if (!active || disposed || !Object.keys(pending).length) {
      return;
    }
    const data = pending;
    pending = Object.create(null);
    nativeSetData({ ...data });
  };
  const bind = (name, signal) => {
    signals.set(name, signal);
    unbinds.push(trackSignal(signal, ({ value }) => updateData(name, value)));
  };
  const sync = (name) => {
    const signal = signals.get(name);
    if (!signal) {
      return;
    }
    const value = instance.data[name];
    if (isInternalSignalCarrier(signal)) {
      if (replaceShallowCarrierData(signal, value)) {
        return;
      }
      if (isSignalPayloadRef(signal)) {
        signal.value = value;
      } else {
        // 替换根对象时必须反映删除的键，不能仅 Object.assign 残留旧字段。
        for (const key of Object.keys(signal))
          if (!Object.hasOwn(value, key)) {
            delete signal[key];
          }
        Object.assign(signal, value);
      }
    } else {
      const [, set] = useSignal(signal);
      set?.(value, { forced: true });
    }
  };
  const setData = (data, callback) => {
    if (disposed) {
      throw Error('cannot setData on a disposed instance');
    }
    if (data === null || typeof data !== 'object') {
      throw new TypeError('setData requires an object');
    }
    const roots = new Set(
      Object.keys(data).map((key) => key.split(/[.\[]/)[0]),
    );
    if (![...roots].some((key) => signals.has(key))) {
      // 原生字段不参与 Signal 反馈，保留平台回调和提交路径。
      return nativeSetData(data, callback);
    }
    // 原生 data 同步变化；回调仅表示渲染完成。同步 mock 的回调也不能抢在状态反馈之前。
    let returned = false;
    let completed = false;
    syncing = true;
    try {
      nativeSetData(data, () => {
        if (!returned) {
          completed = true;
        } else if (!disposed) {
          callback?.call(instance);
        }
      });
      for (const key of roots) {
        sync(key);
      }
    } finally {
      syncing = false;
      returned = true;
      flush();
    }
    if (completed && !disposed) {
      callback?.call(instance);
    }
  };
  const activate = (initial) => {
    if (active || disposed) {
      return;
    }
    for (const [key, value] of Object.entries(initial)) {
      if (isPure(key)) {
        instance.data[key] = value;
      } else if (!Object.hasOwn(pending, key)) {
        pending[key] = snapshotViewData(value);
      }
    }
    active = true;
    flush();
  };
  const dispose = () => {
    disposed = true;
    pending = Object.create(null);
    signals.clear();
    for (const stop of unbinds) {
      stop();
    }
    unbinds.length = 0;
  };
  return { setData, bind, unbinds, activate, dispose };
}
