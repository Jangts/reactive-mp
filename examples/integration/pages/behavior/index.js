/** BEH-01/EXT-01 原生对照页：暴露可复现操作与观察结果，不在宿主里伪造通过。 */
Page({
  increment() {
    this.selectComponent('#native').increment();
    this.selectComponent('#reactive').increment();
  },
  report() {
    return Object.fromEntries(
      ['native', 'reactive', 'isolated'].map((id) => {
        const instance = this.selectComponent(`#${id}`);
        return [id, { count: instance.data.count, label: instance.data.label }];
      }),
    );
  },
});
