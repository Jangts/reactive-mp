/** 请求阶段错误及显式提示，保留底层原因，不自动展示网络错误。 */
import { WechatError } from '../result.js';
import { wxToastErrorMessage } from '../wx/toast.js';

export class NetworkError extends WechatError {
  /** tag 区分请求、响应和并发抑制；自定义 errTag 只作为业务标记保留。 */
  constructor(error, tag = 'reqerr') {
    super(error?.message ?? error?.errMsg ?? String(error ?? 'Network error'), {
      api: 'request',
      code: error?.code ?? 'NETWORK_ERROR',
      cause: error,
    });
    this.name = 'NetworkError';
    this._neterr = tag;
    this.errTag = error?.errTag;
  }
}

/** 不重复包装已归类的网络错误。 */
export function wrapNetworkError(error, tag = 'reqerr') {
  return error instanceof NetworkError ? error : new NetworkError(error, tag);
}

export const isNetworkError = (error) => error instanceof NetworkError;
export const isNetReqErr = (error) =>
  isNetworkError(error) && error._neterr === 'reqerr';
export const isNetResErr = (error) =>
  isNetworkError(error) && error._neterr === 'reserr';

/** 只提示响应阶段错误；不属于该阶段时明确返回未展示。 */
export function showResponseErrMsg(error, defaultMessage) {
  if (!isNetResErr(error)) {
    return Promise.resolve([true, false]);
  }
  return wxToastErrorMessage(error, defaultMessage);
}

/** 用户显式要求时展示网络错误消息。 */
export function showNetErrMsg(error, defaultMessage = '网络错误') {
  return wxToastErrorMessage(error, defaultMessage);
}
