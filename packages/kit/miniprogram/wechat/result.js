/** 微信适配层的错误和回调桥接；只在调用时读取宿主，不注册全局副作用。 */
export class WechatError extends Error {
  /** 保留原始失败对象；HTTP 失败额外暴露 statusCode 和 data。 */
  constructor(message, { api = '', code = 'WX_ERROR', cause } = {}) {
    super(message);
    this.name = 'WechatError';
    this.api = api;
    this.code = code;
    this.errMsg = message;
    this.cause = cause;
    this.statusCode = cause?.statusCode;
    this.data = cause?.data;
  }
}

/** 将原生对象、字符串或异常统一为可检查的错误，原始原因留在 cause。 */
export function toWechatError(error, api, code = 'WX_ERROR') {
  if (error instanceof WechatError) {
    return error;
  }
  return new WechatError(
    error?.errMsg ?? error?.message ?? String(error ?? `${api} failed`),
    { api, code, cause: error },
  );
}

/** 获取当前微信宿主；包导入本身不要求 wx 存在。 */
export function getWechat() {
  if (typeof wx === 'undefined') {
    throw new WechatError('WeChat host is unavailable', {
      code: 'HOST_UNAVAILABLE',
    });
  }
  return wx;
}

/** 包装原生回调与同步异常，task 由调用方负责取消和解除监听。 */
export function callWechat(api, options = {}, transform = (value) => value) {
  let task;
  const promise = new Promise((resolve) => {
    let completed = false;
    const fail = (error) => {
      if (!completed) {
        completed = true;
        resolve([false, toWechatError(error, api)]);
      }
    };
    try {
      const host = getWechat();
      task = host[api]({
        ...options,
        success(value) {
          if (completed) {
            return;
          }
          completed = true;
          try {
            Promise.resolve(transform(value)).then(
              (payload) => resolve([true, payload]),
              (error) => resolve([false, toWechatError(error, api)]),
            );
          } catch (error) {
            resolve([false, toWechatError(error, api)]);
          }
        },
        fail,
      });
    } catch (error) {
      fail(error);
    }
  });
  Object.defineProperty(promise, 'task', { get: () => task });
  return promise;
}
