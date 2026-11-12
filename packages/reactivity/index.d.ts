/** 包级公开类型合同；参数、只读及生命周期语义与同包实现保持一致。 */
export interface Signal<T = unknown> {
  (): T;
  readonly value: T;
  readonly __is_signal: true;
}
export interface ComputedSignal<T = unknown> extends Signal<T> {
  readonly __is_computed: true;
}
export interface UpdateOptions {
  forced?: boolean;
  shouldBeRetrack?: boolean;
}
export type SignalEmitter<T> = (value: T, options?: UpdateOptions) => boolean;
export interface WatchHandle {
  (): void;
  stop(): void;
  pause(): void;
  resume(): void;
}
export interface TrackPayload<T> {
  value: T;
  oldValue: T;
  shouldBeRetrack?: boolean;
}
export interface TrackOptions {
  onTrack?: (event: { type: string; payload: unknown }) => void;
  onTrigger?: (event: { type: string; payload: unknown }) => void;
}
export interface WatchOptions extends TrackOptions {
  immediate?: boolean;
  once?: boolean;
}
declare const carrier: unique symbol;
export type ReadonlyCarrier<T extends object> = Readonly<T> & {
  readonly [carrier]: T;
};
export type Reactive<T extends object> = T & { readonly [carrier]: T };
export interface Ref<T> {
  value: T;
}
export type WatchValue<T> =
  T extends Signal<infer V>
    ? V
    : T extends Ref<infer V>
      ? V
      : T extends () => infer V
        ? V
        : T;
export type WatchValues<T extends readonly unknown[]> = {
  [K in keyof T]: WatchValue<T[K]>;
};
export interface EffectScope {
  run<T>(fn: () => T): T;
  stop(): void;
  /** 登记清理，返回解除登记函数；解除登记不会执行清理。 */
  onDispose(handle: () => void): () => void;
}
export function useSignal<T extends object>(
  value: ReadonlyCarrier<T> | Reactive<T>,
): [Signal<T>, null];
export function useSignal<T>(value: Ref<T>): [Signal<T>, null];
export function useSignal<T>(
  value: ComputedSignal<T>,
): [ComputedSignal<T>, null];
export function useSignal<T>(
  value: T | Signal<T>,
): [Signal<T>, SignalEmitter<T>];
export function useComputedSignal<T>(
  getter: () => T,
  options?: TrackOptions,
): ComputedSignal<T>;
export { useComputedSignal as computed };
export function watchSignals<T extends readonly unknown[]>(
  source: readonly [...T],
  callback: (
    values: WatchValues<T>,
    previous: { [K in keyof T]: WatchValue<T[K]> | undefined },
  ) => void,
  options?: WatchOptions,
): WatchHandle;
export function watchSignals<T>(
  source: T,
  callback: (value: WatchValue<T>, previous: WatchValue<T> | undefined) => void,
  options?: WatchOptions,
): WatchHandle;
export { watchSignals as watch };
export function watchEffect(
  effect: () => void,
  options?: TrackOptions,
): WatchHandle;
export function createEffectScope(detached?: boolean): EffectScope;
export function getCurrentEffectScope(): EffectScope | null;
export function onScopeDispose(handle: () => void): boolean;
export function runInEffectFreeScope<T>(fn: () => T): T;
export function isRunInEffectFreeScope(): boolean;
export function reactive<T extends object>(target: T): Reactive<T>;
export function ref<T>(value: T): Ref<T>;
export function isSignal(
  target: unknown,
  realOnly?: boolean,
): target is Signal<unknown>;
export function isComputedSignal(
  target: unknown,
): target is ComputedSignal<unknown>;
export { isComputedSignal as isComputed };
export function isWatchable(target: unknown): boolean;
export function isSignalPayloadRef(target: unknown): target is Ref<unknown>;
export { isSignalPayloadRef as isRef };
export function isInternalSignalCarrier(target: unknown): boolean;
export function interpretSignal<T>(
  target: Signal<T> | Ref<T> | Reactive<T & object>,
  silent?: boolean,
): T;
export function trackSignal<T>(
  target: Signal<T> | Ref<T> | Reactive<T & object>,
  effect: (payload: TrackPayload<T>) => void,
): () => void;
export function useSignalCarrier<T extends object>(
  target: T,
  type?: new (target: T) => object,
): [ReadonlyCarrier<T>, (source: Partial<T>) => boolean];
export { useSignalCarrier as signalized };
export function useMutableSignalCarrier<T extends object>(
  target: T,
): [T, (source: Partial<T>) => boolean];
export { useMutableSignalCarrier as mutable };
