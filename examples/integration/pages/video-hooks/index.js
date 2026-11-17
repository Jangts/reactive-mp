/** Reactive Page 直接通过 useVideo 管理当前页面的原生 video 节点。 */
import { definePage, computed } from '../../vendor/reactive-mp/src/index.js';
import { useVideo } from '../../vendor/components/miniprogram/video/index.js';
import { useVideoDemo } from '../../hooks/use-video-demo.js';
definePage(() => {
  const demo = useVideoDemo();
  const video = useVideo(
    {
      get src() {
        return demo.src();
      },
      get paused() {
        return demo.paused();
      },
      loop: false,
    },
    { selector: '#player', group: false, emit: demo.recordEvent },
  );
  return {
    ...demo,
    ...video,
    status: computed(() => (video.state.isPlaying ? '播放中' : '已暂停')),
    position: computed(
      () =>
        `${video.state.currentTime.toFixed(1)} / ${video.state.mediaDuration.toFixed(1)} 秒`,
    ),
  };
});
