/** 原生 Behavior 对照：属性默认值由过滤器修改，方法与嵌套行为由平台合并。 */
const nested = Behavior({
  properties: { count: { type: Number, value: 1 } },
  methods: {
    increment() {
      this.setData({ count: this.data.count + 1 });
    },
  },
});
export const sharedBehavior = Behavior({
  behaviors: [nested],
  definitionFilter(fields) {
    fields.properties = {
      ...fields.properties,
      count: { type: Number, value: 4 },
    };
  },
});
