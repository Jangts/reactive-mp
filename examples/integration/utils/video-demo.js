/** 视频演示的本地媒体与事件展示格式，不进入视频包。 */
export const media = {
  src: '/assets/video/demo.mp4',
  poster: '/assets/video/poster.png',
};
export function formatSummary(name, detail) {
  return `${name}：${detail.reason}，播放 ${detail.duration.toFixed(2)} 秒，位置 ${detail.currentTime.toFixed(1)} 秒，结束=${detail.finished}`;
}
