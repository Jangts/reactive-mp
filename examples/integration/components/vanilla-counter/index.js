/** 无库依赖的普通组件：原生属性、setData、事件及方法。 */
Component({
  properties: { prefix: String },
  data: { count: 0 },
  methods: {
    incrementRaw() {
      this.setData({ count: this.data.count + 1 });
      this.triggerEvent('change', { value: this.data.count });
    },
  },
});
