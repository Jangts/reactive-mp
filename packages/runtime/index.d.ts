/** 包级公开类型合同；参数、只读及生命周期语义与同包实现保持一致。 */
import type { Signal } from '@reactive-mp/reactivity';
export interface NativeInstance {
  data: Record<string, unknown>;
  properties: Record<string, unknown>;
  setData(data: Record<string, unknown>, callback?: () => void): void;
  triggerEvent(
    name: string,
    detail?: unknown,
    options?: Record<string, unknown>,
  ): void;
  getPageId(): string;
  selectComponent(selector: string): NativeInstance | object | null;
  selectOwnerComponent(): NativeInstance | object | null;
  [name: string]: unknown;
}
/** 属性 schema 的实际值；工厂默认值保留其返回类型。 */
export type PropertyType<P> = P extends { default: () => infer V }
  ? V
  : P extends { type: infer T; optionalTypes?: infer O }
    ? | PropertyType<T>
      | (O extends readonly unknown[] ? PropertyType<O[number]> : never)
    : P extends StringConstructor
      ? string
      : P extends NumberConstructor
        ? number
        : P extends BooleanConstructor
          ? boolean
          : P extends ArrayConstructor
            ? unknown[]
            : P extends FunctionConstructor
              ? (...args: unknown[]) => unknown
              : P extends ObjectConstructor
                ? Record<string, unknown> | null
                : P extends { value: infer V }
                  ? V
                  : unknown;
export type Props<P> = { readonly [K in keyof P]: PropertyType<P[K]> };
export interface NativeOptions {
  data?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  methods?: Record<string, (...args: any[]) => any>;
  lifetimes?: Record<string, (...args: any[]) => any>;
  pageLifetimes?: Record<string, (...args: any[]) => any>;
  observers?: Record<string, (...args: any[]) => any>;
  options?: Record<string, unknown>;
  behaviors?: unknown[];
  [name: string]: unknown;
}
export interface SetupContext {
  readonly $this: NativeInstance | null;
  readonly isPage: boolean;
  readonly isComponent: boolean;
  /** Advanced stage introspection; ordinary hooks do not need these flags. */
  readonly isSettingUpOptions: boolean;
  readonly isSettingUpInstance: boolean;
  defineOptions(options: Record<string, unknown>): void;
  inject<T>(key: string | symbol, defaultValue?: T): Signal<T>;
  observe(source: unknown, callback: (...values: any[]) => void): () => void;
  behaviors(behavior: unknown | unknown[], ...more: unknown[]): void;
  provide<T>(key: string | symbol, data: T | Signal<T> | (() => T)): void;
  onPullDownRefresh(handle: () => void): void;
  onReachBottom(handle: () => void): void;
  onPageScroll(handle: (event: { scrollTop: number }) => void): void;
  onTabItemTap(handle: (event: unknown) => void): void;
  onShareAppMessage(handle: (...args: any[]) => PageHookResult): void;
  onShareTimeline(handle: (...args: any[]) => PageHookResult): void;
  onAddToFavorites(handle: (...args: any[]) => PageHookResult): void;
  onSaveExitState(handle: (...args: any[]) => PageHookResult): void;
}
export interface ComponentContext extends SetupContext {
  $emit(
    name: string,
    detail?: unknown,
    options?: Record<string, unknown>,
  ): void;
  defineProps<P extends Record<string, unknown> = Record<string, unknown>>(
    schema?: P,
  ): Props<P>;
  extClasses(names: string | string[], ...more: (string | string[])[]): void;
  defineRelation(name: string, relation: Record<string, unknown>): void;
  defineExpose(value: object | (() => object)): void;
  inject<T>(key: string | symbol, defaultValue?: T): Signal<T>;
  observe(source: unknown, callback: (...values: any[]) => void): () => void;
  page<T extends object>(result: T): T;
}
/** 原生页面返回值允许平台异步结果；不在适配层展开或广播 Promise。 */
export type PageHookResult =
  Record<string, unknown> | void | Promise<Record<string, unknown> | void>;
/** 应用初始化的原生参数，额外平台字段保持 unknown。 */
export interface AppLaunchOptions {
  path: string;
  query: Record<string, unknown>;
  scene: number;
  [name: string]: unknown;
}
export interface AppContext {
  readonly isApp: true;
  onLaunch(handle: (options: AppLaunchOptions) => void): void;
  onShow(handle: (options: AppLaunchOptions) => void): void;
  onHide(handle: () => void): void;
  onError(handle: (error: string) => void): void;
  onPageNotFound(
    handle: (options: {
      path: string;
      query: Record<string, unknown>;
      isEntryPage: boolean;
    }) => void,
  ): void;
  onUnhandledRejection(
    handle: (event: { reason: unknown; promise: Promise<unknown> }) => void,
  ): void;
  onThemeChange(handle: (event: { theme: 'light' | 'dark' }) => void): void;
}
export type Setup<C = SetupContext> = (context: C) => object | void;
export function definePage(setup: Setup, options?: NativeOptions): void;
export function definePage(options: NativeOptions & { setup?: Setup }): void;
export function defineComponent(
  setup: Setup<ComponentContext>,
  options?: NativeOptions,
): void;
export function defineComponent(
  options: NativeOptions & { setup?: Setup<ComponentContext> },
): void;
export function defineComponentPage(
  setup: Setup<ComponentContext>,
  options?: NativeOptions,
): void;
export function defineComponentPage(
  options: NativeOptions & { setup?: Setup<ComponentContext> },
): void;
export function defineApp<T extends object>(
  setup: (context: AppContext) => T,
  options?: NativeOptions,
): void;
export function defineApp(
  options: NativeOptions & { setup?: (context: AppContext) => object | void },
): void;
export function useSetupApp<T extends object = Record<string, unknown>>(): T;
export function useCurrentInstance(): NativeInstance | null;
export function useCurrentPage(): NativeInstance | null;
export function inject<T>(key: string | symbol, defaultValue?: T): Signal<T>;
export function provide<T>(
  key: string | symbol,
  value: T | Signal<T> | (() => T),
): void;
export function observe(
  source: unknown,
  callback: (...values: any[]) => void,
): () => void;
export function behaviors(
  behavior: unknown | unknown[],
  ...more: unknown[]
): void;
export function extClasses(
  names: string | string[],
  ...more: (string | string[])[]
): void;
export function relation(
  name: string,
  description: Record<string, unknown>,
): void;
export interface ScheduleHandle {
  (): void;
  restart(): void;
}
export function useSchedule(
  task: () => void,
  config?: number | { interval?: number; times?: number; immediate?: boolean },
): ScheduleHandle;
export function subscribeGlobalData<T>(
  key: string,
  callback: (value: T, previous: T) => void,
): () => void;
export function pickGlobalData(...keys: string[]): Record<string, unknown>;
export function mapGlobalData(
  key: string,
  instance: NativeInstance,
  dataKey?: string,
): () => void;
export function dispatchAppAction<T = unknown>(
  action: string,
  ...payload: unknown[]
): T;

export function onCreated(handle: (...args: any[]) => void): void;
export function onAttached(handle: (...args: any[]) => void): void;
export function onLoad(handle: (...args: any[]) => void): void;
export function onShow(handle: (...args: any[]) => void): void;
export function onReady(handle: (...args: any[]) => void): void;
export function onRouteDone(handle: (...args: any[]) => void): void;
export function onHide(handle: (...args: any[]) => void): void;
export function onMoved(handle: (...args: any[]) => void): void;
export function onDetached(handle: (...args: any[]) => void): void;
export function onUnload(handle: (...args: any[]) => void): void;
export function onPageResize(handle: (...args: any[]) => void): void;
export function onComponentError(handle: (...args: any[]) => void): void;
export function onPullDownRefresh(handle: (...args: any[]) => void): void;
export function onReachBottom(handle: (...args: any[]) => void): void;
export function onPageScroll(handle: (...args: any[]) => void): void;
export function onTabItemTap(handle: (...args: any[]) => void): void;
export function onBeforeMounted(handle: (...args: any[]) => void): void;
export function onMounted(handle: (...args: any[]) => void): void;
export function onUnmounted(handle: (...args: any[]) => void): void;

export function onShareAppMessage(
  handle: (...args: any[]) => PageHookResult,
): void;
export function onShareTimeline(
  handle: (...args: any[]) => PageHookResult,
): void;
export function onAddToFavorites(
  handle: (...args: any[]) => PageHookResult,
): void;
export function onSaveExitState(
  handle: (...args: any[]) => PageHookResult,
): void;

/** 节点移除前：停止视图操作，detached 仍执行资源清理。 */
export function onBeforeDetach(handle: () => void): void;
export function onLaunch(handle: (options: AppLaunchOptions) => void): void;
export function onAppError(handle: (error: string) => void): void;
export function onPageNotFound(
  handle: (options: {
    path: string;
    query: Record<string, unknown>;
    isEntryPage: boolean;
  }) => void,
): void;
export function onUnhandledRejection(
  handle: (event: { reason: unknown; promise: Promise<unknown> }) => void,
): void;
export function onThemeChange(
  handle: (event: { theme: 'light' | 'dark' }) => void,
): void;
