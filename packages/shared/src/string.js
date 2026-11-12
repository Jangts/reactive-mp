/** 通用字符串标识工具；随机短标识不用于认证或秘密值。 */
export function shortUUID() {
  return Math.random().toString(16).slice(2, 10);
}
