/** 微信原生封装类型；保留任务、原生响应和可辨别的失败结果。 */
import type {
  MaybePromise,
  NativeCall,
  RequestTask,
  Result,
  UploadTask,
} from './result.js';
export { WechatError } from './result.js';
export type { NativeCall, RequestTask, Result, UploadTask } from './result.js';

export function wxLogin(options?: {
  timeout?: number;
}): Promise<Result<string>>;
export function wxAuthorize(scope: string): Promise<Result<''>>;
export interface SubscriptionsSetting {
  mainSwitch?: boolean;
  itemSettings?: Record<string, string>;
}
export function wxCheckSubscriptionsSetting(): Promise<
  Result<SubscriptionsSetting>
>;
export function requestSubscriptionsNotification(
  tmplId: string,
): Promise<Result<Record<string, string>>>;

export interface RequestResponse<T = unknown> {
  statusCode: number;
  data: T;
  header: Record<string, string>;
  errMsg: string;
  cookies?: string[];
  profile?: unknown;
}
export interface RequestOptions {
  method?:
    | 'OPTIONS'
    | 'GET'
    | 'HEAD'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'TRACE'
    | 'CONNECT'
    | 'PATCH';
  data?: unknown;
  header?: Record<string, string>;
  timeout?: number;
  dataType?: string;
  responseType?: 'text' | 'arraybuffer';
  enableHttp2?: boolean;
  enableQuic?: boolean;
  enableCache?: boolean;
  enableChunked?: boolean;
  sslVerify?: boolean;
  validateStatus?: (statusCode: number) => boolean;
}
export function wxRequest<T = unknown>(
  url: string,
  options?: RequestOptions,
): NativeCall<RequestResponse<T>, RequestTask>;

export interface TempImageFile {
  path: string;
  size: number;
}
export function wxChooseImage(options?: {
  count?: number;
  sizeType?: ('original' | 'compressed')[];
  sourceType?: ('album' | 'camera')[];
}): Promise<Result<TempImageFile[]>>;
export interface UploadResponse {
  statusCode: number;
  data: string;
  errMsg: string;
}
export interface UploadOptions<T = UploadResponse> {
  url: string;
  filePath: string;
  name: string;
  header?: Record<string, string>;
  formData?: Record<string, string | number | boolean>;
  timeout?: number;
  parseResponse?: (response: UploadResponse) => MaybePromise<T>;
}
export function wxUploadFile<T = UploadResponse>(
  options: UploadOptions<T>,
): NativeCall<T, UploadTask>;
export interface ImageInfo {
  width: number;
  height: number;
  path: string;
  orientation: string;
  type: string;
}
export function wxGetImageInfo(src: string): Promise<Result<ImageInfo>>;

export function getStorageItem<T = unknown>(key: string): Result<T>;
export function setStorageItem<T>(key: string, data: T): Result<T>;

export interface BoundingClientRect {
  id: string;
  dataset: Record<string, unknown>;
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}
export interface NodesRef<T = BoundingClientRect> {
  boundingClientRect(callback: (result: T | null) => void): { exec(): unknown };
}
export interface Selection {
  component<T = unknown>(): T | null;
  rect(): Promise<Result<BoundingClientRect>>;
  data(): Promise<Result<Record<string, unknown>>>;
  data(key: string): Promise<Result<unknown>>;
}
export interface ComponentSelector {
  selectComponent(selector: string): unknown;
}
export function wxQuerySelector(selector: string, context?: object): NodesRef;
export function wxQuerySelectorAll(
  selector: string,
  context?: object,
): NodesRef<BoundingClientRect[]>;
export function wxSelect(
  selector: string,
  context: ComponentSelector,
): Selection;
export function wxSelect(
  selector: string,
  context?: object,
): Omit<Selection, 'component'>;
export function wxSelectAll(
  selector: string,
  context?: object,
): { rects(): Promise<Result<BoundingClientRect[]>> };
export function wxSelectEvt<
  D extends object = Record<string, unknown>,
  S extends object = Record<string, unknown>,
>(event: {
  detail?: D;
  currentTarget?: { dataset?: S };
}): {
  detail(): D | undefined;
  detail<K extends keyof D>(key: K): D[K] | undefined;
  data(): Partial<S>;
  data<K extends keyof S>(key: K): S[K] | undefined;
};

export interface ToastOptions {
  title: string;
  icon?: 'success' | 'error' | 'loading' | 'none';
  image?: string;
  duration?: number;
  mask?: boolean;
}
export function wxShowToast(
  options: string | ToastOptions,
): Promise<Result<{ errMsg: string }>>;
export function wxToastErrorMessage(
  error: unknown,
  defaultMessage?: string,
): ReturnType<typeof wxShowToast>;

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue | readonly QueryValue[]>;
export type Route = string | { path: string; query?: Query };
export interface FormattedRoute {
  url: string;
  path: string;
  query: string;
  isTabRoute: boolean;
}
export interface NavigationResponse {
  errMsg: string;
  eventChannel?: {
    emit(eventName: string, ...args: unknown[]): void;
    on(eventName: string, listener: (...args: unknown[]) => void): void;
    off(eventName: string, listener?: (...args: unknown[]) => void): void;
    once(eventName: string, listener: (...args: unknown[]) => void): void;
  };
}
export type NavigationEvents = Record<string, (...args: unknown[]) => void>;
export interface Router {
  navigateTo(
    route: Route,
    events?: NavigationEvents,
  ): Promise<Result<NavigationResponse>>;
  redirectTo(route: Route): Promise<Result<NavigationResponse>>;
  switchTab(route: Route): Promise<Result<NavigationResponse>>;
  reLaunch(route: Route): Promise<Result<NavigationResponse>>;
  navigateBack(delta?: number): Promise<Result<NavigationResponse>>;
}
export function formatRoute(
  route: Route,
  tabRoutes?: readonly string[],
): FormattedRoute;
export function createRouter(options?: {
  tabRoutes?: readonly string[];
}): Router;
export const wxNavigateTo: Router['navigateTo'];
export const wxRedirectTo: Router['redirectTo'];
export const wxSwitchTab: Router['switchTab'];
export const wxReLaunch: Router['reLaunch'];
export const wxNavigateBack: Router['navigateBack'];
