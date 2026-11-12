/** 兼容的作用域子入口，与根入口使用同一实现。 */
export {
  createEffectScope as default,
  getCurrentEffectScope,
  onScopeDispose,
  runInEffectFreeScope,
  isRunInEffectFreeScope,
} from './index.js';
