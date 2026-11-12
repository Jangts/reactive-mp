/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
export {
  default as createEffectScope,
  getCurrentEffectScope,
  onScopeDispose,
} from './EffectScope.js';
export {
  isSignal,
  isComputedSignal,
  isComputedSignal as isComputed,
  isWatchable,
  useSignal,
  useComputedSignal,
  useComputedSignal as computed,
  trackSignal,
  interpretSignal,
  watchSignals,
  watchSignals as watch,
  watchEffect,
} from './signal.js';
export {
  isInternalSignalCarrier,
  isSignalPayloadRef,
  isSignalPayloadRef as isRef,
  useSignalCarrier,
  useSignalCarrier as signalized,
  reactive,
  ref,
} from './signal-carriers/carriers.js';
export {
  default as useMutableSignalCarrier,
  default as mutable,
} from './signal-carriers/MutableSignalCarrier.js';

export { runInEffectFreeScope, isRunInEffectFreeScope } from './EffectScope.js';
