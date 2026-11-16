/** 错误聚合兼容层：缺少原生 AggregateError 时仍保留所有失败，不修改全局。 */
export const CombinedError =
  globalThis.AggregateError ??
  class extends Error {
    constructor(errors, message) {
      super(message);
      this.name = 'AggregateError';
      this.errors = Array.from(errors);
    }
  };
