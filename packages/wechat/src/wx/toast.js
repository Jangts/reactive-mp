/** 微信提示接口；仅在显式调用时展示，不承担请求或权限决策。 */
import { callWechat, WechatError } from '../result.js';

/** 字符串使用无图标提示，其余选项按原生字段透传。 */
export function wxShowToast(options) {
  const config = typeof options === 'string' ? { title: options } : options;
  if (!config?.title) {
    return Promise.resolve([
      false,
      new WechatError('Toast title is required', {
        api: 'showToast',
        code: 'INVALID_ARGUMENT',
      }),
    ]);
  }
  return callWechat('showToast', { icon: 'none', ...config });
}

/** 展示可读错误；调用方提供找不到消息时的文案。 */
export function wxToastErrorMessage(error, defaultMessage = '操作失败') {
  const message =
    typeof error === 'string' ? error : (error?.message ?? error?.errMsg);
  return wxShowToast(message || defaultMessage);
}
