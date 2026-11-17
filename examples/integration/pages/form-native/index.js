/** 普通页面通过原生组件消费表单，函数注册留在 JS。 */
import { formExample } from '../form/example-data.js';
Page({
  data: { ...formExample, result: '' },
  onReady() {
    this.selectComponent('#form').setValidators({
      email: async (value) => !value || String(value).includes('@'),
    });
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values, null, 2) });
  },
});
