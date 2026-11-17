/** 同步缓存读写；通过 keys 区分缺失值与已存储的空字符串。 */
import { getWechat, toWechatError, WechatError } from '../result.js';

/** 返回原始值，保留 false、0、空串和 null；缺失返回明确错误。 */
export function getStorageItem(key) {
  try {
    const host = getWechat();
    if (!host.getStorageInfoSync().keys.includes(key)) {
      return [
        false,
        new WechatError(`Storage key not found: ${key}`, {
          api: 'getStorageSync',
          code: 'STORAGE_NOT_FOUND',
        }),
      ];
    }
    return [true, host.getStorageSync(key)];
  } catch (error) {
    return [false, toWechatError(error, 'getStorageSync')];
  }
}

/** 写入成功返回同一数据值，原生异常转换为失败结果。 */
export function setStorageItem(key, data) {
  try {
    getWechat().setStorageSync(key, data);
    return [true, data];
  } catch (error) {
    return [false, toWechatError(error, 'setStorageSync')];
  }
}
