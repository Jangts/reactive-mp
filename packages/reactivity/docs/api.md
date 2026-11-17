# API 参考

公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。

## @reactive-mp/reactivity

[类型及完整签名](../index.d.ts) · [实现入口](../src/index.js)

| API | 类型签名 |
| --- | --- |
| computed | `<T>(getter: () => T, options?: TrackOptions) => ComputedSignal<T>` |
| createEffectScope | `(detached?: boolean) => EffectScope` |
| getCurrentEffectScope | `() => EffectScope \| null` |
| interpretSignal | `<T>(target: Signal<T> \| Ref<T> \| Reactive<T & object>, silent?: boolean) => T` |
| isComputed | `(target: unknown) => target is ComputedSignal<unknown>` |
| isComputedSignal | `(target: unknown) => target is ComputedSignal<unknown>` |
| isInternalSignalCarrier | `(target: unknown) => boolean` |
| isRef | `(target: unknown) => target is Ref<unknown>` |
| isRunInEffectFreeScope | `() => boolean` |
| isSignal | `(target: unknown, realOnly?: boolean) => target is Signal<unknown>` |
| isSignalPayloadRef | `(target: unknown) => target is Ref<unknown>` |
| isWatchable | `(target: unknown) => boolean` |
| mutable | `<T extends object>(target: T) => [T, (source: Partial<T>) => boolean]` |
| onScopeDispose | `(handle: () => void) => boolean` |
| reactive | `<T extends object>(target: T) => Reactive<T>` |
| ref | `<T>(value: T) => Ref<T>` |
| runInEffectFreeScope | `<T>(fn: () => T) => T` |
| signalized | `<T extends object>(target: T, type?: new (target: T) => object) => [ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |
| trackSignal | `<T>(target: Signal<T> \| Ref<T> \| Reactive<T & object>, effect: (payload: TrackPayload<T>) => void) => () => void` |
| useComputedSignal | `<T>(getter: () => T, options?: TrackOptions) => ComputedSignal<T>` |
| useMutableSignalCarrier | `<T extends object>(target: T) => [T, (source: Partial<T>) => boolean]` |
| useSignal | `{ <T extends object>(value: ReadonlyCarrier<T> \| Reactive<T>): [Signal<T>, null]; <T>(value: Ref<T>): [Signal<T>, null]; <T>(value: ComputedSignal<T>): [ComputedSignal<T>, null]; <T>(value: T \| Signal<T>): [Signal<T>, SignalEmitter<T>]; }` |
| useSignalCarrier | `<T extends object>(target: T, type?: new (target: T) => object) => [ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |
| watch | `{ <T extends readonly unknown[]>(source: readonly [...T], callback: (values: WatchValues<T>, previous: { [K in keyof T]: WatchValue<T[K]> \| undefined; }) => void, options?: WatchOptions): WatchHandle; <T>(source: T, callback: (value: WatchValue<T>, previous: WatchValue<T> \| undefined) => void, options?: WatchOptions): WatchHandle; }` |
| watchEffect | `(effect: () => void, options?: TrackOptions) => WatchHandle` |
| watchSignals | `{ <T extends readonly unknown[]>(source: readonly [...T], callback: (values: WatchValues<T>, previous: { [K in keyof T]: WatchValue<T[K]> \| undefined; }) => void, options?: WatchOptions): WatchHandle; <T>(source: T, callback: (value: WatchValue<T>, previous: WatchValue<T> \| undefined) => void, options?: WatchOptions): WatchHandle; }` |

## @reactive-mp/reactivity/signal

[类型及完整签名](../signal.d.ts) · [实现入口](../src/signal.js)

| API | 类型签名 |
| --- | --- |
| carrySignal | `(target: object, signal: Signal<unknown>) => () => boolean` |
| emitSignal | `<T>(target: Signal<T> \| Ref<T> \| Reactive<T & object>, payload: UpdateOptions & { value: T; }) => boolean` |
| interpretSignal | `<T>(target: Signal<T> \| Ref<T> \| Reactive<T & object>, silent?: boolean) => T` |
| isComputedSignal | `(target: unknown) => target is import("./index.js").ComputedSignal<unknown>` |
| isGetter | `(value: unknown) => value is () => unknown` |
| isSignal | `(target: unknown, realOnly?: boolean) => target is Signal<unknown>` |
| isWatchable | `(target: unknown) => boolean` |
| protectSignal | `(signal: Signal<unknown>) => boolean` |
| trackSignal | `<T>(target: Signal<T> \| Ref<T> \| Reactive<T & object>, effect: (payload: import("./index.js").TrackPayload<T>) => void) => () => void` |
| useComputedSignal | `<T>(getter: () => T, options?: import("./index.js").TrackOptions) => import("./index.js").ComputedSignal<T>` |
| useSignal | `{ <T extends object>(value: import("./index.js").ReadonlyCarrier<T> \| Reactive<T>): [Signal<T>, null]; <T>(value: Ref<T>): [Signal<T>, null]; <T>(value: import("./index.js").ComputedSignal<T>): [import("./index.js").ComputedSignal<T>, null]; <T>(value: T \| Signal<T>): [Signal<T>, import("./index.js").SignalEmitter<T>]; }` |
| watchEffect | `(effect: () => void, options?: import("./index.js").TrackOptions) => import("./index.js").WatchHandle` |
| watchSignals | `{ <T extends readonly unknown[]>(source: readonly [...T], callback: (values: import("./index.js").WatchValues<T>, previous: { [K in keyof T]: import("./index.js").WatchValue<T[K]> \| undefined; }) => void, options?: import("./index.js").WatchOptions): import("./index.js").WatchHandle; <T>(source: T, callback: (value: import("./index.js").WatchValue<T>, previous: import("./index.js").WatchValue<T> \| undefined) => void, options?: import("./index.js").WatchOptions): import("./index.js").WatchHandle; }` |

## @reactive-mp/reactivity/EffectScope

[类型及完整签名](../effect-scope.d.ts) · [实现入口](../src/EffectScope.js)

| API | 类型签名 |
| --- | --- |
| default | `(detached?: boolean) => import("./index.js").EffectScope` |
| getCurrentEffectScope | `() => import("./index.js").EffectScope \| null` |
| isRunInEffectFreeScope | `() => boolean` |
| onScopeDispose | `(handle: () => void) => boolean` |
| runInEffectFreeScope | `<T>(fn: () => T) => T` |

## @reactive-mp/reactivity/signal-carriers/carriers

[类型及完整签名](../carriers.d.ts) · [实现入口](../src/signal-carriers/carriers.js)

| API | 类型签名 |
| --- | --- |
| SignalCarrier | `typeof SignalCarrier` |
| isInternalSignalCarrier | `(target: unknown) => boolean` |
| isSignalPayloadRef | `(target: unknown) => target is import("./index.js").Ref<unknown>` |
| reactive | `<T extends object>(target: T) => import("./index.js").Reactive<T>` |
| ref | `<T>(value: T) => import("./index.js").Ref<T>` |
| replaceShallowCarrierData | `(carrier: object, value: object) => boolean` |
| useSignalCarrier | `<T extends object>(target: T, type?: new (target: T) => object) => [import("./index.js").ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |

