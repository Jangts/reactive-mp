/** 版式目录统一提供默认露出、缩放及侧翼旋转规则。 */
export const swiperLayouts = Object.freeze({
  plain: Object.freeze({ peek: '0px', scale: 1, rotate: 0 }),
  focus: Object.freeze({ peek: '32rpx', scale: 0.9, rotate: 0 }),
  coverflow: Object.freeze({ peek: '48rpx', scale: 0.9, rotate: 18 }),
});
export function resolveLayout(name) {
  return Object.hasOwn(swiperLayouts, name)
    ? swiperLayouts[name]
    : swiperLayouts.plain;
}
export function normalizeIndex(index, count, circular = false) {
  if (count <= 0) {
    return 0;
  }
  const value = Number.isFinite(index) ? Math.trunc(index) : 0;
  return circular
    ? ((value % count) + count) % count
    : Math.max(0, Math.min(value, count - 1));
}
export function itemEntries(items, itemKey) {
  const used = new Set();
  return items.map((value, index) => {
    const id = value && typeof value === 'object' ? value[itemKey] : undefined;
    let key =
      typeof id === 'string' || typeof id === 'number'
        ? `${typeof id}:${id}`
        : `index:${index}`;
    if (used.has(key)) {
      key = `duplicate:${index}:${key}`;
    }
    used.add(key);
    return { key, value, index };
  });
}
