/** 请求与路由共用的查询串编码；数组重复 key，忽略 undefined，null 编为空串。 */
export function appendQuery(url, query = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item !== undefined) {
        parts.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(item ?? '')}`,
        );
      }
    }
  }
  if (!parts.length) {
    return url;
  }
  const hashIndex = url.indexOf('#');
  const base = hashIndex < 0 ? url : url.slice(0, hashIndex);
  const hash = hashIndex < 0 ? '' : url.slice(hashIndex);
  let separator = base.includes('?') ? '&' : '?';
  if (base.endsWith('?') || base.endsWith('&')) {
    separator = '';
  }
  return base + separator + parts.join('&') + hash;
}
