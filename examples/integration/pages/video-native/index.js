/** 传统 Page 通过公开组件属性、方法和事件使用 rmp video。 */
import { media, formatSummary } from '../../utils/video-demo.js';
Page({
  data: {
    ...media,
    paused: false,
    visible: true,
    summaries: [],
    lastEvent: '等待操作',
  },
  togglePaused() {
    this.setData({ paused: !this.data.paused });
  },
  toggleVisible() {
    this.setData({ visible: !this.data.visible });
  },
  controlVideo(event) {
    const player = this.selectComponent('#player');
    const action = event.currentTarget.dataset.action;
    if (['play', 'pause', 'stop'].includes(action)) {
      player?.[action]();
    }
  },
  onVideoEvent(event) {
    this.setData({ lastEvent: event.detail.errMsg || event.type });
  },
  onPlaybackSummary(event) {
    this.setData({
      summaries: [
        formatSummary('视频', event.detail),
        ...this.data.summaries,
      ].slice(0, 8),
    });
  },
});
