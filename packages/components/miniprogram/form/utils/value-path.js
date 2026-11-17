/** 表单纯数据快照、结构比较与字段路径；不依赖宿主或响应式。 */
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
export function toPath(path) {
  const parts = Array.isArray(path)
    ? [...path]
    : String(path ?? '')
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean)
        .map((part) => (/^\d+$/.test(part) ? Number(part) : part));
  if (
    !parts.length ||
    parts.some(
      (part) =>
        forbidden.has(String(part)) ||
        (typeof part !== 'string' && (!Number.isInteger(part) || part < 0)),
    )
  ) {
    throw new TypeError('Invalid form field path');
  }
  return parts;
}
export const pathKey = (path) => JSON.stringify(toPath(path));
export function clone(value) {
  if (Array.isArray(value)) {
    return value.map(clone);
  }
  if (value && typeof value === 'object') {
    if (
      Object.getPrototypeOf(value) !== Object.prototype &&
      Object.getPrototypeOf(value) !== null
    ) {
      throw new TypeError('Form values must be plain data');
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      if (forbidden.has(key)) {
        throw new TypeError('Unsafe form value key');
      }
      result[key] = clone(item);
    }
    return result;
  }
  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  ) {
    throw new TypeError('Form values must be plain data');
  }
  return value;
}
export function equal(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    !a ||
    !b ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    return false;
  }
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.hasOwn(b, key) && equal(a[key], b[key]))
  );
}
export function getValue(values, path) {
  return toPath(path).reduce(
    (value, part) =>
      value != null && Object.hasOwn(value, part) ? value[part] : undefined,
    values,
  );
}
export function hasValue(values, path) {
  const parts = toPath(path);
  const last = parts.pop();
  const parent = parts.reduce((value, part) => value?.[part], values);
  return parent != null && Object.hasOwn(parent, last);
}
export function putValue(values, path, value, remove = false) {
  const parts = toPath(path);
  let parent = values;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!parent[part] || typeof parent[part] !== 'object') {
      parent[part] = typeof parts[i + 1] === 'number' ? [] : {};
    }
    parent = parent[part];
  }
  if (remove) {
    delete parent[parts.at(-1)];
  } else {
    parent[parts.at(-1)] = clone(value);
  }
}
