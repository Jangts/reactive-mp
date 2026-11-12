/** 数组合并工具：明确旧项与新项的顺序和重复值处理。 */
import { isArray } from './type.js';

/**
 * @template T
 * @param {T[] | any} existsEles
 * @param {(T | any)[] | any} newComeEles
 * @param {(el: any)=> el is T} check
 * @returns {T[]}
 */
export function mergeArrayOrderByExists(
  existsEles,
  newComeEles,
  check = () => true,
) {
  const arr = isArray(existsEles)
    ? existsEles.filter(
        (el) => !(isArray(newComeEles) && newComeEles.includes(el)),
      )
    : [];
  if (isArray(newComeEles)) {
    newComeEles.forEach((el) => check(el) && !arr.includes(el) && arr.push(el));
  }

  return arr;
}

/**
 * @template T
 * @param {T[] | any} existsEles
 * @param {(T | any)[] | any} newComeEles
 * @param {(el: any)=> el is T} check
 * @returns {T[]}
 */
export function mergeArrayOrderByNewCome(
  existsEles,
  newComeEles,
  check = () => true,
) {
  const arr = isArray(existsEles) ? [...new Set(existsEles)] : [];
  if (isArray(newComeEles)) {
    newComeEles.forEach((el) => check(el) && !arr.includes(el) && arr.push(el));
  }
  return arr;
}
