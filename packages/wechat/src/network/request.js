/** 可配置微信请求客户端；统一 URL、异步拦截器和最多一次的显式重试入口。 */
import { appendQuery } from '../query.js';
import { wxRequest } from '../wx/request.js';
import { wrapNetworkError } from './errors.js';

// 公开便捷方法的唯一清单；正文请求仍可传入其他原生 method。
const requestMethods = {
  get: { method: 'GET', body: false },
  delete: { method: 'DELETE', body: false },
  post: { method: 'POST', body: true },
  put: { method: 'PUT', body: true },
  patch: { method: 'PATCH', body: true },
};

/** 仅为相对地址添加 baseURL；查询参数在所有调用入口统一追加。 */
function requestUrl(url, baseURL, params) {
  const isAbsolute = /^[a-z][\w+.-]*:\/\//i.test(url) || url.startsWith('//');
  const fullUrl =
    isAbsolute || !baseURL
      ? url
      : baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '');
  return appendQuery(fullUrl, params);
}

/** 请求头按不区分大小写合并，调用级字段覆盖默认字段。 */
function mergeHeaders(defaults, headers) {
  return Object.fromEntries(
    [...Object.entries(defaults), ...Object.entries(headers ?? {})].map(
      ([key, value]) => [key.toLowerCase(), value],
    ),
  );
}

/**
 * 创建独立客户端；拦截器返回 payload，失败抛出后转换为 Result。
 * retryHandle 返回 Result，由拦截器显式解包；库不自动重试或刷新身份。
 */
export function createRequest(baseURL = '', options = {}) {
  const {
    headers = { 'content-type': 'application/json' },
    timeout = 10000,
    interceptors = {},
  } = options;

  async function perform(url, config, allowRetry) {
    let prepared;
    try {
      prepared = {
        ...config,
        url: requestUrl(url, baseURL, config.params),
        headers: mergeHeaders(headers, config.headers),
        timeout: config.timeout ?? timeout,
        method: config.method ?? 'GET',
        meta: config.meta ?? {},
      };
      prepared = (await interceptors.onRequest?.(prepared)) ?? prepared;
    } catch (error) {
      return [false, wrapNetworkError(error, 'reqerr')];
    }
    const { headers: header, params, meta, retry, ...nativeOptions } = prepared;
    const [ok, response] = await wxRequest(prepared.url, {
      ...nativeOptions,
      header,
    });
    let retried;
    const context = {
      ...prepared,
      retryHandle: allowRetry
        ? () => {
            retried ??= perform(url, config, false);
            return retried;
          }
        : undefined,
    };
    try {
      if (ok) {
        const payload = interceptors.onResponseResolve
          ? await interceptors.onResponseResolve(response, context)
          : response;
        return [true, payload];
      }
      const tag = response.code === 'HTTP_ERROR' ? 'reserr' : 'reqerr';
      const error = wrapNetworkError(response, tag);
      if (interceptors.onResponseReject) {
        return [true, await interceptors.onResponseReject(error, context)];
      }
      return [false, error];
    } catch (error) {
      return [false, wrapNetworkError(error, 'reserr')];
    }
  }

  function request(url, config = {}) {
    return perform(url, config, config.retry !== false);
  }
  for (const [name, { method, body }] of Object.entries(requestMethods)) {
    request[name] = body
      ? (url, data, config = {}) => request(url, { ...config, method, data })
      : (url, params, config = {}) =>
          request(url, { ...config, method, params: params ?? config.params });
  }
  return request;
}
