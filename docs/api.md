# API 参考

公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。

## reactive-mp

[类型及完整签名](../packages/reactive-mp/index.d.ts) · [实现入口](../packages/reactive-mp/src/index.js)

| API | 类型签名 |
| --- | --- |
| EventBus | `typeof import("@reactive-mp/shared").EventBus` |
| behaviors | `(behavior: unknown \| unknown[], ...more: unknown[]) => void` |
| computed | `<T>(getter: () => T, options?: import("@reactive-mp/reactivity").TrackOptions) => import("@reactive-mp/reactivity").ComputedSignal<T>` |
| createEffectScope | `(detached?: boolean) => import("@reactive-mp/reactivity").EffectScope` |
| debounceMicrotask | `<A extends unknown[]>(fn: (...args: A) => void, onTrigger?: (...args: A) => void) => (...args: A) => void` |
| defineApp | `{ <T extends object>(setup: (context: import("@reactive-mp/runtime").AppContext) => T, options?: import("@reactive-mp/runtime").NativeOptions): void; (options: import("@reactive-mp/runtime").NativeOptions & { setup?: (context: import("@reactive-mp/runtime").AppContext) => object \| void; }): void; }` |
| defineComponent | `{ (setup: import("@reactive-mp/runtime").Setup<import("@reactive-mp/runtime").ComponentContext>, options?: import("@reactive-mp/runtime").NativeOptions): void; (options: import("@reactive-mp/runtime").NativeOptions & { setup?: import("@reactive-mp/runtime").Setup<import("@reactive-mp/runtime").ComponentContext>; }): void; }` |
| defineComponentPage | `{ (setup: import("@reactive-mp/runtime").Setup<import("@reactive-mp/runtime").ComponentContext>, options?: import("@reactive-mp/runtime").NativeOptions): void; (options: import("@reactive-mp/runtime").NativeOptions & { setup?: import("@reactive-mp/runtime").Setup<import("@reactive-mp/runtime").ComponentContext>; }): void; }` |
| definePage | `{ (setup: import("@reactive-mp/runtime").Setup, options?: import("@reactive-mp/runtime").NativeOptions): void; (options: import("@reactive-mp/runtime").NativeOptions & { setup?: import("@reactive-mp/runtime").Setup; }): void; }` |
| defineStore | `<T extends object>(id: string, setup: () => T) => import("@reactive-mp/store").StoreDefinition<T>` |
| dispatchAppAction | `<T = unknown>(action: string, ...payload: unknown[]) => T` |
| extClasses | `(names: string \| string[], ...more: (string \| string[])[]) => void` |
| formatPositiveInteger | `(value: unknown, fallback?: number) => number` |
| get | `(target: unknown, path: string) => unknown` |
| getCurrentEffectScope | `() => import("@reactive-mp/reactivity").EffectScope \| null` |
| hasOwnProp | `(target: object, property: PropertyKey) => boolean` |
| inject | `<T>(key: string \| symbol, defaultValue?: T) => import("@reactive-mp/reactivity").Signal<T>` |
| interpretSignal | `<T>(target: import("@reactive-mp/reactivity").Signal<T> \| import("@reactive-mp/reactivity").Ref<T> \| import("@reactive-mp/reactivity").Reactive<T & object>, silent?: boolean) => T` |
| isArray | `(value: unknown) => value is unknown[]` |
| isBoolean | `(value: unknown) => value is boolean` |
| isComputed | `(target: unknown) => target is import("@reactive-mp/reactivity").ComputedSignal<unknown>` |
| isComputedSignal | `(target: unknown) => target is import("@reactive-mp/reactivity").ComputedSignal<unknown>` |
| isConstructor | `(value: unknown) => value is new (...args: any[]) => any` |
| isDimensionString | `(value: unknown) => boolean` |
| isFloat | `(value: unknown) => boolean` |
| isFloatString | `(value: unknown) => boolean` |
| isFunction | `(value: unknown) => value is (...args: any[]) => any` |
| isInteger | `(value: unknown) => boolean` |
| isIntegerString | `(value: unknown) => boolean` |
| isInternalSignalCarrier | `(target: unknown) => boolean` |
| isMap | `(value: unknown) => boolean` |
| isMeasurable | `(value: unknown) => boolean` |
| isNameLessFunction | `(value: unknown) => boolean` |
| isNaturalNumber | `(value: unknown) => boolean` |
| isNonEmptyArray | `(value: unknown) => value is [unknown, ...unknown[]]` |
| isNonEmptyObject | `(value: unknown) => boolean` |
| isNonEmptyString | `(value: unknown) => boolean` |
| isNonNullObject | `(value: unknown) => value is object` |
| isNumber | `(value: unknown) => value is number` |
| isNumeric | `(value: unknown) => boolean` |
| isNumericString | `(value: unknown) => boolean` |
| isObject | `(value: unknown) => boolean` |
| isParamlessFunction | `(value: unknown) => boolean` |
| isPercentageString | `(value: unknown) => boolean` |
| isPlainObject | `(value: unknown) => value is Record<string, unknown>` |
| isPositiveFloat | `(value: unknown) => boolean` |
| isPositiveInteger | `(value: unknown) => boolean` |
| isPositiveNumber | `(value: unknown) => boolean` |
| isRef | `(target: unknown) => target is import("@reactive-mp/reactivity").Ref<unknown>` |
| isRegExp | `(value: unknown) => boolean` |
| isRunInEffectFreeScope | `() => boolean` |
| isSet | `(value: unknown) => boolean` |
| isSignal | `(target: unknown, realOnly?: boolean) => target is import("@reactive-mp/reactivity").Signal<unknown>` |
| isSignalPayloadRef | `(target: unknown) => target is import("@reactive-mp/reactivity").Ref<unknown>` |
| isString | `(value: unknown) => value is string` |
| isSymbol | `(value: unknown) => value is symbol` |
| isWatchable | `(target: unknown) => boolean` |
| isWeakMap | `(value: unknown) => boolean` |
| mapGlobalData | `(key: string, instance: import("@reactive-mp/runtime").NativeInstance, dataKey?: string) => () => void` |
| mergeArrayOrderByExists | `<T>(existing: T[], incoming: T[], check?: (item: T) => boolean) => T[]` |
| mergeArrayOrderByNewCome | `<T>(existing: T[], incoming: T[], check?: (item: T) => boolean) => T[]` |
| mergeCallbacks | `(callbacks: ((...args: any[]) => unknown)[], thisArg?: unknown, ...args: unknown[]) => (...args: unknown[]) => unknown` |
| mutable | `<T extends object>(target: T) => [T, (source: Partial<T>) => boolean]` |
| observe | `(source: unknown, callback: (...values: any[]) => void) => () => void` |
| onAddToFavorites | `(handle: (...args: any[]) => import("@reactive-mp/runtime").PageHookResult) => void` |
| onAppError | `(handle: (error: string) => void) => void` |
| onAttached | `(handle: (...args: any[]) => void) => void` |
| onBeforeDetach | `(handle: () => void) => void` |
| onBeforeMounted | `(handle: (...args: any[]) => void) => void` |
| onComponentError | `(handle: (...args: any[]) => void) => void` |
| onCreated | `(handle: (...args: any[]) => void) => void` |
| onDetached | `(handle: (...args: any[]) => void) => void` |
| onHide | `(handle: (...args: any[]) => void) => void` |
| onLaunch | `(handle: (options: import("@reactive-mp/runtime").AppLaunchOptions) => void) => void` |
| onLoad | `(handle: (...args: any[]) => void) => void` |
| onMounted | `(handle: (...args: any[]) => void) => void` |
| onMoved | `(handle: (...args: any[]) => void) => void` |
| onPageNotFound | `(handle: (options: { path: string; query: Record<string, unknown>; isEntryPage: boolean; }) => void) => void` |
| onPageResize | `(handle: (...args: any[]) => void) => void` |
| onPageScroll | `(handle: (...args: any[]) => void) => void` |
| onPullDownRefresh | `(handle: (...args: any[]) => void) => void` |
| onReachBottom | `(handle: (...args: any[]) => void) => void` |
| onReady | `(handle: (...args: any[]) => void) => void` |
| onRouteDone | `(handle: (...args: any[]) => void) => void` |
| onSaveExitState | `(handle: (...args: any[]) => import("@reactive-mp/runtime").PageHookResult) => void` |
| onScopeDispose | `(handle: () => void) => boolean` |
| onShareAppMessage | `(handle: (...args: any[]) => import("@reactive-mp/runtime").PageHookResult) => void` |
| onShareTimeline | `(handle: (...args: any[]) => import("@reactive-mp/runtime").PageHookResult) => void` |
| onShow | `(handle: (...args: any[]) => void) => void` |
| onTabItemTap | `(handle: (...args: any[]) => void) => void` |
| onThemeChange | `(handle: (event: { theme: "light" \| "dark"; }) => void) => void` |
| onUnhandledRejection | `(handle: (event: { reason: unknown; promise: Promise<unknown>; }) => void) => void` |
| onUnload | `(handle: (...args: any[]) => void) => void` |
| onUnmounted | `(handle: (...args: any[]) => void) => void` |
| onceInvokable | `<A extends unknown[], R>(fn: (...args: A) => R, message?: string) => (...args: A) => R` |
| pickGlobalData | `(...keys: string[]) => Record<string, unknown>` |
| provide | `<T>(key: string \| symbol, value: T \| import("@reactive-mp/reactivity").Signal<T> \| (() => T)) => void` |
| reactive | `<T extends object>(target: T) => import("@reactive-mp/reactivity").Reactive<T>` |
| ref | `<T>(value: T) => import("@reactive-mp/reactivity").Ref<T>` |
| relation | `(name: string, description: Record<string, unknown>) => void` |
| runInEffectFreeScope | `<T>(fn: () => T) => T` |
| scheduleMicrotask | `(task: () => void) => void` |
| shortUUID | `() => string` |
| signalized | `<T extends object>(target: T, type?: new (target: T) => object) => [import("@reactive-mp/reactivity").ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends import("@reactive-mp/reactivity").Signal<unknown> \| import("@reactive-mp/reactivity").Ref<unknown> ? K : never; }[keyof T]>` |
| subscribeGlobalData | `<T>(key: string, callback: (value: T, previous: T) => void) => () => void` |
| trackSignal | `<T>(target: import("@reactive-mp/reactivity").Signal<T> \| import("@reactive-mp/reactivity").Ref<T> \| import("@reactive-mp/reactivity").Reactive<T & object>, effect: (payload: import("@reactive-mp/reactivity").TrackPayload<T>) => void) => () => void` |
| useComputedSignal | `<T>(getter: () => T, options?: import("@reactive-mp/reactivity").TrackOptions) => import("@reactive-mp/reactivity").ComputedSignal<T>` |
| useCurrentInstance | `() => import("@reactive-mp/runtime").NativeInstance \| null` |
| useCurrentPage | `() => import("@reactive-mp/runtime").NativeInstance \| null` |
| useMutableSignalCarrier | `<T extends object>(target: T) => [T, (source: Partial<T>) => boolean]` |
| useSchedule | `(task: () => void, config?: number \| { interval?: number; times?: number; immediate?: boolean; }) => import("@reactive-mp/runtime").ScheduleHandle` |
| useSetupApp | `<T extends object = Record<string, unknown>>() => T` |
| useSignal | `{ <T extends object>(value: import("@reactive-mp/reactivity").ReadonlyCarrier<T> \| import("@reactive-mp/reactivity").Reactive<T>): [import("@reactive-mp/reactivity").Signal<T>, null]; <T>(value: import("@reactive-mp/reactivity").Ref<T>): [import("@reactive-mp/reactivity").Signal<T>, null]; <T>(value: import("@reactive-mp/reactivity").ComputedSignal<T>): [import("@reactive-mp/reactivity").ComputedSignal<T>, null]; <T>(value: T \| import("@reactive-mp/reactivity").Signal<T>): [import("@reactive-mp/reactivity").Signal<T>, import("@reactive-mp/reactivity").SignalEmitter<T>]; }` |
| useSignalCarrier | `<T extends object>(target: T, type?: new (target: T) => object) => [import("@reactive-mp/reactivity").ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |
| watch | `{ <T extends readonly unknown[]>(source: readonly [...T], callback: (values: import("@reactive-mp/reactivity").WatchValues<T>, previous: { [K in keyof T]: import("@reactive-mp/reactivity").WatchValue<T[K]> \| undefined; }) => void, options?: import("@reactive-mp/reactivity").WatchOptions): import("@reactive-mp/reactivity").WatchHandle; <T>(source: T, callback: (value: import("@reactive-mp/reactivity").WatchValue<T>, previous: import("@reactive-mp/reactivity").WatchValue<T> \| undefined) => void, options?: import("@reactive-mp/reactivity").WatchOptions): import("@reactive-mp/reactivity").WatchHandle; }` |
| watchEffect | `(effect: () => void, options?: import("@reactive-mp/reactivity").TrackOptions) => import("@reactive-mp/reactivity").WatchHandle` |
| watchSignals | `{ <T extends readonly unknown[]>(source: readonly [...T], callback: (values: import("@reactive-mp/reactivity").WatchValues<T>, previous: { [K in keyof T]: import("@reactive-mp/reactivity").WatchValue<T[K]> \| undefined; }) => void, options?: import("@reactive-mp/reactivity").WatchOptions): import("@reactive-mp/reactivity").WatchHandle; <T>(source: T, callback: (value: import("@reactive-mp/reactivity").WatchValue<T>, previous: import("@reactive-mp/reactivity").WatchValue<T> \| undefined) => void, options?: import("@reactive-mp/reactivity").WatchOptions): import("@reactive-mp/reactivity").WatchHandle; }` |

## reactive-mp/native-tools

[类型及完整签名](../packages/reactive-mp/native-tools.d.ts) · [实现入口](../packages/reactive-mp/tools/prepare-native.mjs)

| API | 类型签名 |
| --- | --- |
| prepareNativeSources | `(output: string, packages?: Map<string, { manifest: { name: string; exports: Record<string, unknown>; }; root: string; folder: string; }>) => Promise<void>` |
| resolveNativeExport | `(manifest: { name: string; exports: Record<string, unknown>; }, suffix: string) => string` |

## @reactive-mp/reactivity

[类型及完整签名](../packages/reactivity/index.d.ts) · [实现入口](../packages/reactivity/src/index.js)

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

[类型及完整签名](../packages/reactivity/signal.d.ts) · [实现入口](../packages/reactivity/src/signal.js)

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

[类型及完整签名](../packages/reactivity/effect-scope.d.ts) · [实现入口](../packages/reactivity/src/EffectScope.js)

| API | 类型签名 |
| --- | --- |
| default | `(detached?: boolean) => import("./index.js").EffectScope` |
| getCurrentEffectScope | `() => import("./index.js").EffectScope \| null` |
| isRunInEffectFreeScope | `() => boolean` |
| onScopeDispose | `(handle: () => void) => boolean` |
| runInEffectFreeScope | `<T>(fn: () => T) => T` |

## @reactive-mp/reactivity/signal-carriers/carriers

[类型及完整签名](../packages/reactivity/carriers.d.ts) · [实现入口](../packages/reactivity/src/signal-carriers/carriers.js)

| API | 类型签名 |
| --- | --- |
| SignalCarrier | `typeof SignalCarrier` |
| isInternalSignalCarrier | `(target: unknown) => boolean` |
| isSignalPayloadRef | `(target: unknown) => target is import("./index.js").Ref<unknown>` |
| reactive | `<T extends object>(target: T) => import("./index.js").Reactive<T>` |
| ref | `<T>(value: T) => import("./index.js").Ref<T>` |
| replaceShallowCarrierData | `(carrier: object, value: object) => boolean` |
| useSignalCarrier | `<T extends object>(target: T, type?: new (target: T) => object) => [import("./index.js").ReadonlyCarrier<T>, (source: Partial<T>) => boolean]` |

## @reactive-mp/runtime

[类型及完整签名](../packages/runtime/index.d.ts) · [实现入口](../packages/runtime/src/index.js)

| API | 类型签名 |
| --- | --- |
| behaviors | `(behavior: unknown \| unknown[], ...more: unknown[]) => void` |
| defineApp | `{ <T extends object>(setup: (context: AppContext) => T, options?: NativeOptions): void; (options: NativeOptions & { setup?: (context: AppContext) => object \| void; }): void; }` |
| defineComponent | `{ (setup: Setup<ComponentContext>, options?: NativeOptions): void; (options: NativeOptions & { setup?: Setup<ComponentContext>; }): void; }` |
| defineComponentPage | `{ (setup: Setup<ComponentContext>, options?: NativeOptions): void; (options: NativeOptions & { setup?: Setup<ComponentContext>; }): void; }` |
| definePage | `{ (setup: Setup, options?: NativeOptions): void; (options: NativeOptions & { setup?: Setup; }): void; }` |
| dispatchAppAction | `<T = unknown>(action: string, ...payload: unknown[]) => T` |
| extClasses | `(names: string \| string[], ...more: (string \| string[])[]) => void` |
| inject | `<T>(key: string \| symbol, defaultValue?: T) => Signal<T>` |
| mapGlobalData | `(key: string, instance: NativeInstance, dataKey?: string) => () => void` |
| observe | `(source: unknown, callback: (...values: any[]) => void) => () => void` |
| onAddToFavorites | `(handle: (...args: any[]) => PageHookResult) => void` |
| onAppError | `(handle: (error: string) => void) => void` |
| onAttached | `(handle: (...args: any[]) => void) => void` |
| onBeforeDetach | `(handle: () => void) => void` |
| onBeforeMounted | `(handle: (...args: any[]) => void) => void` |
| onComponentError | `(handle: (...args: any[]) => void) => void` |
| onCreated | `(handle: (...args: any[]) => void) => void` |
| onDetached | `(handle: (...args: any[]) => void) => void` |
| onHide | `(handle: (...args: any[]) => void) => void` |
| onLaunch | `(handle: (options: AppLaunchOptions) => void) => void` |
| onLoad | `(handle: (...args: any[]) => void) => void` |
| onMounted | `(handle: (...args: any[]) => void) => void` |
| onMoved | `(handle: (...args: any[]) => void) => void` |
| onPageNotFound | `(handle: (options: { path: string; query: Record<string, unknown>; isEntryPage: boolean; }) => void) => void` |
| onPageResize | `(handle: (...args: any[]) => void) => void` |
| onPageScroll | `(handle: (...args: any[]) => void) => void` |
| onPullDownRefresh | `(handle: (...args: any[]) => void) => void` |
| onReachBottom | `(handle: (...args: any[]) => void) => void` |
| onReady | `(handle: (...args: any[]) => void) => void` |
| onRouteDone | `(handle: (...args: any[]) => void) => void` |
| onSaveExitState | `(handle: (...args: any[]) => PageHookResult) => void` |
| onShareAppMessage | `(handle: (...args: any[]) => PageHookResult) => void` |
| onShareTimeline | `(handle: (...args: any[]) => PageHookResult) => void` |
| onShow | `(handle: (...args: any[]) => void) => void` |
| onTabItemTap | `(handle: (...args: any[]) => void) => void` |
| onThemeChange | `(handle: (event: { theme: "light" \| "dark"; }) => void) => void` |
| onUnhandledRejection | `(handle: (event: { reason: unknown; promise: Promise<unknown>; }) => void) => void` |
| onUnload | `(handle: (...args: any[]) => void) => void` |
| onUnmounted | `(handle: (...args: any[]) => void) => void` |
| pickGlobalData | `(...keys: string[]) => Record<string, unknown>` |
| provide | `<T>(key: string \| symbol, value: T \| Signal<T> \| (() => T)) => void` |
| relation | `(name: string, description: Record<string, unknown>) => void` |
| subscribeGlobalData | `<T>(key: string, callback: (value: T, previous: T) => void) => () => void` |
| useCurrentInstance | `() => NativeInstance \| null` |
| useCurrentPage | `() => NativeInstance \| null` |
| useSchedule | `(task: () => void, config?: number \| { interval?: number; times?: number; immediate?: boolean; }) => ScheduleHandle` |
| useSetupApp | `<T extends object = Record<string, unknown>>() => T` |

## @reactive-mp/shared

[类型及完整签名](../packages/shared/index.d.ts) · [实现入口](../packages/shared/src/index.js)

| API | 类型签名 |
| --- | --- |
| EventBus | `typeof EventBus` |
| debounceMicrotask | `<A extends unknown[]>(fn: (...args: A) => void, onTrigger?: (...args: A) => void) => (...args: A) => void` |
| formatPositiveInteger | `(value: unknown, fallback?: number) => number` |
| get | `(target: unknown, path: string) => unknown` |
| hasOwnProp | `(target: object, property: PropertyKey) => boolean` |
| isArray | `(value: unknown) => value is unknown[]` |
| isBoolean | `(value: unknown) => value is boolean` |
| isConstructor | `(value: unknown) => value is new (...args: any[]) => any` |
| isDimensionString | `(value: unknown) => boolean` |
| isFloat | `(value: unknown) => boolean` |
| isFloatString | `(value: unknown) => boolean` |
| isFunction | `(value: unknown) => value is (...args: any[]) => any` |
| isInteger | `(value: unknown) => boolean` |
| isIntegerString | `(value: unknown) => boolean` |
| isMap | `(value: unknown) => boolean` |
| isMeasurable | `(value: unknown) => boolean` |
| isNameLessFunction | `(value: unknown) => boolean` |
| isNaturalNumber | `(value: unknown) => boolean` |
| isNonEmptyArray | `(value: unknown) => value is [unknown, ...unknown[]]` |
| isNonEmptyObject | `(value: unknown) => boolean` |
| isNonEmptyString | `(value: unknown) => boolean` |
| isNonNullObject | `(value: unknown) => value is object` |
| isNumber | `(value: unknown) => value is number` |
| isNumeric | `(value: unknown) => boolean` |
| isNumericString | `(value: unknown) => boolean` |
| isObject | `(value: unknown) => boolean` |
| isParamlessFunction | `(value: unknown) => boolean` |
| isPercentageString | `(value: unknown) => boolean` |
| isPlainObject | `(value: unknown) => value is Record<string, unknown>` |
| isPositiveFloat | `(value: unknown) => boolean` |
| isPositiveInteger | `(value: unknown) => boolean` |
| isPositiveNumber | `(value: unknown) => boolean` |
| isRegExp | `(value: unknown) => boolean` |
| isSet | `(value: unknown) => boolean` |
| isString | `(value: unknown) => value is string` |
| isSymbol | `(value: unknown) => value is symbol` |
| isWeakMap | `(value: unknown) => boolean` |
| mergeArrayOrderByExists | `<T>(existing: T[], incoming: T[], check?: (item: T) => boolean) => T[]` |
| mergeArrayOrderByNewCome | `<T>(existing: T[], incoming: T[], check?: (item: T) => boolean) => T[]` |
| mergeCallbacks | `(callbacks: ((...args: any[]) => unknown)[], thisArg?: unknown, ...args: unknown[]) => (...args: unknown[]) => unknown` |
| onceInvokable | `<A extends unknown[], R>(fn: (...args: A) => R, message?: string) => (...args: A) => R` |
| scheduleMicrotask | `(task: () => void) => void` |
| shortUUID | `() => string` |

## @reactive-mp/store

[类型及完整签名](../packages/store/index.d.ts) · [实现入口](../packages/store/src/index.js)

| API | 类型签名 |
| --- | --- |
| default | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| defineStore | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends Signal<unknown> \| Ref<unknown> ? K : never; }[keyof T]>` |

