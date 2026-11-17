/** 微信图片与上传接口；不绑定业务地址、凭证或后端数据结构。 */
import { callWechat, WechatError } from '../result.js';

/** 选择图片并返回 tempFiles；取消等原生失败保留在错误 cause 中。 */
export function wxChooseImage(options = {}) {
  return callWechat('chooseImage', options, (response) => response.tempFiles);
}

/** 上传返回原生响应或等待解析结果；UploadTask 由调用方管理。 */
export function wxUploadFile(options) {
  const { parseResponse = (response) => response, ...nativeOptions } = options;
  return callWechat('uploadFile', nativeOptions, (response) => {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new WechatError(`HTTP ${response.statusCode}`, {
        api: 'uploadFile',
        code: 'HTTP_ERROR',
        cause: response,
      });
    }
    return parseResponse(response);
  });
}

/** 获取图片的原生尺寸、路径和方向信息。 */
export function wxGetImageInfo(src) {
  return callWechat('getImageInfo', { src });
}
