/** 普通 Page 无需 setup，同时使用原生和组合式组件，并导航到 definePage。 */
Page({
  data: {
    kind: '原生 Page',
    count: 0,
    double: 0,
    vanilla: 0,
    visible: true,
    prefix: 'initial',
    events: 0,
    lastValue: 0,
  },
  incrementRaw() {
    const count = this.data.count + 1;
    this.setData({ count, double: count * 2, vanilla: this.data.vanilla + 1 });
  },
  toggle() {
    this.setData({ visible: !this.data.visible });
  },
  onChildChange(event) {
    this.setData({
      events: this.data.events + 1,
      lastValue: event.detail.value,
    });
  },
  openOther() {
    wx.navigateTo({ url: '/pages/mixed/index' });
  },
});
