/** 原生请求桥接，保留响应元信息和 RequestTask，不解释业务响应码。 */
import { callWechat, WechatError } from '../result.js';

/** 默认接受 200–399；可配置状态判定，失败保留完整原生响应。 */
export function wxRequest(url, options = {}) {
  const {
    validateStatus = (status) => status >= 200 && status < 400,
    ...rest
  } = options;
  return callWechat('request', { ...rest, url }, (response) => {
    if (!validateStatus(response.statusCode)) {
      throw new WechatError(`HTTP ${response.statusCode}`, {
        api: 'request',
        code: 'HTTP_ERROR',
        cause: response,
      });
    }
    return response;
  });
}
