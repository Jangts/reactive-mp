/** 属性快照只用于识别输入变化，保留逻辑层回调和循环引用，不执行 JSON 转换。 */
import { isPlainObject } from '@reactive-mp/shared';

export function snapshotPropValue(value, seen = new Map()) {
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (!Array.isArray(value) && !isPlainObject(value)) {
    return value;
  }
  if (seen.has(value)) {
    return seen.get(value);
  }
  const snapshot = Array.isArray(value) ? new Array(value.length) : {};
  seen.set(value, snapshot);
  for (const [key, item] of Object.entries(value)) {
    Object.defineProperty(snapshot, key, {
      value: snapshotPropValue(item, seen),
      enumerable: true,
    });
  }
  return snapshot;
}

export function matchesPropValue(value, snapshot, seen = new Map()) {
  if (Object.is(value, snapshot)) {
    return true;
  }
  if (value instanceof Date && snapshot instanceof Date) {
    return Object.is(value.getTime(), snapshot.getTime());
  }
  const array = Array.isArray(value);
  if (
    array !== Array.isArray(snapshot) ||
    (!array && (!isPlainObject(value) || !isPlainObject(snapshot)))
  ) {
    return false;
  }
  if (array && value.length !== snapshot.length) {
    return false;
  }
  if (seen.has(snapshot)) {
    return seen.get(snapshot) === value;
  }
  seen.set(snapshot, value);
  const keys = Object.keys(value);
  return (
    keys.length === Object.keys(snapshot).length &&
    keys.every(
      (key) =>
        Object.hasOwn(snapshot, key) &&
        matchesPropValue(value[key], snapshot[key], seen),
    )
  );
}
