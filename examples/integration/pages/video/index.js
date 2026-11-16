/** 视频接入场景导航，每种方式对应独立可运行页面。 */
Page({
  data: {
    scenarios: [
      {
        path: 'video-native',
        title: '1. 传统 Page + rmp video',
        detail: '原生页面通过 WXML 和 selectComponent 使用视频组件。',
      },
      {
        path: 'video-reactive',
        title: '2. Reactive Page + rmp video',
        detail: '响应式页面使用同一个视频组件，更新属性并监听事件。',
      },
      {
        path: 'video-hooks',
        title: '3. Reactive Page + useVideo + 原生 video',
        detail: '页面直接调用 Hook，绑定原生节点与响应式状态。',
      },
      {
        path: 'video-group',
        title: '4. rmp group + 多个 rmp video',
        detail: '一个分组内的三个视频进行声音协调和统一静音。',
      },
    ],
  },
  openScenario(event) {
    wx.navigateTo({ url: `/pages/${event.currentTarget.dataset.path}/index` });
  },
});
