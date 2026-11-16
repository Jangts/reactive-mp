/** 原生 Behavior 对照组件，保留原生数据观察器与生命周期。 */
import { sharedBehavior } from '../behavior-shared.js';
Component({
  behaviors: [sharedBehavior],
  data: { label: '' },
  observers: {
    count(value) {
      this.setData({ label: `count=${value}` });
    },
  },
  lifetimes: {
    attached() {
      this.setData({ label: `count=${this.data.count}` });
    },
  },
});
