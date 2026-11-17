/** 微信结果、错误及原生异步任务的公共合同，不依赖全局微信类型。 */
export type Result<T, E = WechatError> = [true, T] | [false, E];
export type MaybePromise<T> = T | PromiseLike<T>;
export class WechatError extends Error {
  constructor(
    message: string,
    options?: { api?: string; code?: string; cause?: unknown },
  );
  readonly api: string;
  readonly code: string;
  readonly errMsg: string;
  readonly cause: unknown;
  readonly statusCode?: number;
  readonly data?: unknown;
}
export interface RequestTask {
  abort(): void;
  onHeadersReceived?(
    listener: (event: { header: Record<string, string> }) => void,
  ): void;
  offHeadersReceived?(
    listener?: (event: { header: Record<string, string> }) => void,
  ): void;
  onChunkReceived?(listener: (event: { data: ArrayBuffer }) => void): void;
  offChunkReceived?(listener?: (event: { data: ArrayBuffer }) => void): void;
}
export interface UploadTask extends RequestTask {
  onProgressUpdate(
    listener: (event: {
      progress: number;
      totalBytesSent: number;
      totalBytesExpectedToSend: number;
    }) => void,
  ): void;
  offProgressUpdate?(
    listener?: (event: {
      progress: number;
      totalBytesSent: number;
      totalBytesExpectedToSend: number;
    }) => void,
  ): void;
}
export type NativeCall<T, Task = unknown> = Promise<Result<T>> & {
  readonly task?: Task;
};
