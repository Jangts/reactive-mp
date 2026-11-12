/** 数字配置归一化工具，保持无效输入与显式缺省的区别。 */
import { isPositiveNumber } from './type.js';

/**
 *
 * @param {number} num
 * @param {number} def
 * @returns {number}
 */
export function formatPositiveInteger(num, def = 0) {
  return isPositiveNumber(num) ? Math.round(num) || def : def;
}
