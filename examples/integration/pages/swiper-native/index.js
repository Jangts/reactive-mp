/** 普通页面使用轮播组件的公开属性、方法和事件。 */
import { swiperDemoItems } from '../../utils/swiper-demo.js';
Page({
  data: {
    items: swiperDemoItems,
    current: 1,
    layout: 'focus',
    disabled: false,
    events: [],
  },
  selectLayout(event) {
    this.setData({ layout: event.currentTarget.dataset.layout });
  },
  toggleTouch() {
    this.setData({ disabled: !this.data.disabled });
  },
  toggleItems() {
    this.setData({
      items:
        this.data.items.length === 3
          ? swiperDemoItems.slice(0, 1)
          : swiperDemoItems,
    });
  },
  nextItem() {
    this.selectComponent('#gallery')?.next();
  },
  previousItem() {
    this.selectComponent('#gallery')?.previous();
  },
  onSwiperEvent(event) {
    const update = {
      events: [
        `${event.type}: ${JSON.stringify(event.detail)}`,
        ...this.data.events,
      ].slice(0, 8),
    };
    if (event.type === 'change') {
      update.current = event.detail.current;
    }
    this.setData(update);
  },
});
