/** 平台适配用 Signal 操作；写入仍遵守只读与依赖约束。 */
import type { Signal, Ref, Reactive, UpdateOptions } from './index.js';
export {
  isSignal,
  isComputedSignal,
  isWatchable,
  useSignal,
  useComputedSignal,
  trackSignal,
  interpretSignal,
  watchSignals,
  watchEffect,
} from './index.js';
export function isGetter(value: unknown): value is () => unknown;
export function carrySignal(
  target: object,
  signal: Signal<unknown>,
): () => boolean;
export function protectSignal(signal: Signal<unknown>): boolean;
export function emitSignal<T>(
  target: Signal<T> | Ref<T> | Reactive<T & object>,
  payload: UpdateOptions & { value: T },
): boolean;
