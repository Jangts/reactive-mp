/** definePage 内混写，并同时挂载原生组件、组合式组件与原生容器。 */
import {
  definePage,
  useSignal,
  computed,
  onLoad,
} from '../../vendor/reactive-mp/src/index.js';
definePage(
  () => {
    const [count, setCount] = useSignal(0);
    onLoad(() => {
      getApp().globalData.mixedLoads.hook++;
    });
    return {
      count,
      double: computed(() => count() * 2),
      incrementReactive: () => setCount(count() + 1),
    };
  },
  {
    data: {
      kind: 'definePage 混写',
      vanilla: 0,
      visible: true,
      prefix: 'initial',
      events: 0,
      lastValue: 0,
    },
    onLoad() {
      getApp().globalData.mixedLoads.native++;
    },
    incrementRaw() {
      this.setData({
        count: this.data.count + 1,
        vanilla: this.data.vanilla + 1,
      });
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
      wx.navigateTo({ url: '/pages/vanilla/index' });
    },
  },
);
