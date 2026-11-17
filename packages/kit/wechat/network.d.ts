/** 请求增强的泛型响应、拦截器、阶段错误和并发包装合同。 */
import { WechatError } from './result.js';
import type { MaybePromise, Result } from './result.js';
import type { Query, RequestOptions, RequestResponse } from './wx.js';
export type { Result, MaybePromise } from './result.js';
export type NetworkErrorTag = 'reqerr' | 'reserr' | 'cancelled';
export class NetworkError extends WechatError {
  constructor(error: unknown, tag?: NetworkErrorTag);
  readonly _neterr: NetworkErrorTag;
  readonly errTag?: string;
}
export function wrapNetworkError(
  error: unknown,
  tag?: NetworkErrorTag,
): NetworkError;
export function isNetworkError(error: unknown): error is NetworkError;
export function isNetReqErr(error: unknown): error is NetworkError;
export function isNetResErr(error: unknown): error is NetworkError;
export function showResponseErrMsg(
  error: unknown,
  defaultMessage?: string,
): Promise<Result<{ errMsg: string } | false>>;
export function showNetErrMsg(
  error: unknown,
  defaultMessage?: string,
): Promise<Result<{ errMsg: string }>>;

export interface RequestConfig extends Omit<RequestOptions, 'header'> {
  headers?: Record<string, string>;
  params?: Query;
  meta?: Record<string, unknown>;
  retry?: boolean;
}
export interface RequestContext extends RequestConfig {
  url: string;
  headers: Record<string, string>;
  timeout: number;
  method: NonNullable<RequestOptions['method']>;
  meta: Record<string, unknown>;
}
export interface ResponseContext<T> extends RequestContext {
  retryHandle?: () => Promise<Result<T, NetworkError>>;
}
export interface CreateRequestOptions<T> {
  headers?: Record<string, string>;
  timeout?: number;
  interceptors?: {
    onRequest?: (
      context: RequestContext,
    ) => MaybePromise<RequestContext | void>;
    onResponseResolve?: (
      response: RequestResponse,
      context: ResponseContext<T>,
    ) => MaybePromise<T>;
    onResponseReject?: (
      error: NetworkError,
      context: ResponseContext<T>,
    ) => MaybePromise<T>;
  };
}
export interface RequestClient<Default = RequestResponse> {
  <T = Default>(
    url: string,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
  get<T = Default>(
    url: string,
    params?: Query,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
  delete<T = Default>(
    url: string,
    params?: Query,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
  post<T = Default>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
  put<T = Default>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
  patch<T = Default>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<Result<T, NetworkError>>;
}
export function createRequest<T = RequestResponse>(
  baseURL?: string,
  options?: CreateRequestOptions<T>,
): RequestClient<T>;
export type RemoteCaller<A extends unknown[], T, E = unknown> = (
  ...args: A
) => MaybePromise<Result<T, E>>;
export interface RequestKeyOptions<A extends unknown[]> {
  key?: (...args: A) => unknown;
}
export function reusableGetter<A extends unknown[], T, E>(
  getter: RemoteCaller<A, T, E>,
  options?: RequestKeyOptions<A>,
): (...args: A) => Promise<Result<T, E | NetworkError>>;
export function debouncedGetter<A extends unknown[], T, E>(
  getter: RemoteCaller<A, T, E>,
  strictMode?: boolean,
  options?: RequestKeyOptions<A>,
): (...args: A) => Promise<Result<T, E | NetworkError>>;
export function debouncedSetter<A extends unknown[], T, E>(
  setter: RemoteCaller<A, T, E>,
  withForce?: boolean,
): ((...args: A) => Promise<Result<T, E | NetworkError>>) & {
  force(...args: A): Promise<Result<T, E | NetworkError>>;
};
