import { isSignal, interpretSignal, trackSignal, onScopeDispose } from '@reactive-mp/reactivity';
import { useSetupApp } from '../main.js';
export function subscribeGlobalData(key, handle) {
  const signal = useSetupApp()[key];
  if (!isSignal(signal)) return () => {};
  const stop = trackSignal(signal, ({ value, oldValue }) => handle(value, oldValue));
  onScopeDispose(stop);
  return stop;
}
export function pickGlobalData(...keys) {
  const records = useSetupApp();
  return Object.fromEntries(keys.map(key => [key, isSignal(records[key]) ? interpretSignal(records[key], true) : records[key]]));
}
export function mapGlobalData(key, instance, dataKey = key) {
  instance.setData({ [dataKey]: pickGlobalData(key)[key] });
  return subscribeGlobalData(key, value => instance.setData({ [dataKey]: value }));
}
export function dispatchAppAction(action, ...payload) {
  const handle = useSetupApp()[action];
  if (typeof handle !== 'function' || isSignal(handle)) throw new TypeError(`unknown app action: ${action}`);
  return handle.apply(typeof getApp === 'function' ? getApp() : undefined, payload);
}
