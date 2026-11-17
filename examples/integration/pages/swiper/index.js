/** 轮播接入场景导航。 */
Page({
  data: {
    scenarios: [
      { path: 'swiper-native', title: '1. 传统 Page + rmp swiper' },
      { path: 'swiper-reactive', title: '2. Reactive Page + 自定义内容' },
      {
        path: 'swiper-hooks',
        title: '3. Reactive Page + useSwiper + 原生 swiper',
      },
      { path: 'swiper-media', title: '4. 图片视频混排 + rmp group' },
    ],
  },
  openScenario(event) {
    wx.navigateTo({ url: `/pages/${event.currentTarget.dataset.path}/index` });
  },
});
