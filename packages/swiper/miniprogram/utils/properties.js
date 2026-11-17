/** 内容、轮播行为及少量版式适配入口。 */
export const swiperProperties = {
  items: { type: Array, value: [] },
  itemKey: { type: String, value: 'id' },
  current: { type: Number, value: 0 },
  circular: { type: Boolean, value: false },
  autoplay: { type: Boolean, value: false },
  interval: { type: Number, value: 5000 },
  duration: { type: Number, value: 300 },
  disableTouch: { type: Boolean, value: false },
  layout: { type: String, value: 'plain' },
  peek: { type: String, value: '' },
  gap: { type: String, value: '0px' },
  indicator: { type: Boolean, value: false },
};
