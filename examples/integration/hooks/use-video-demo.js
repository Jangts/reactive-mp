/** Reactive 演示页面共享的外部属性控制与事件列表。 */
import {
  useSignal,
  useCurrentInstance,
  onLoad,
} from '../vendor/reactive-mp/src/index.js';
import {
  prepareDemoMedia,
  demoPosters,
  formatSummary,
} from '../utils/video-demo.js';
export function useVideoDemo() {
  const instance = useCurrentInstance();
  const [src, setSrc] = useSignal('');
  const [poster, setPoster] = useSignal(demoPosters[0]);
  const [players, setPlayers] = useSignal([]);
  const [paused, setPaused] = useSignal(false);
  const [visible, setVisible] = useSignal(true);
  const [summaries, setSummaries] = useSignal([]);
  const [lastEvent, setLastEvent] = useSignal('等待操作');
  onLoad(() => {
    try {
      const clips = prepareDemoMedia();
      setSrc(clips[0].src);
      setPoster(clips[0].poster);
      setPlayers(
        clips.map((clip, index) => ({
          ...clip,
          id: ['first', 'second', 'third'][index],
          name: `视频 ${String.fromCharCode(65 + index)} · ${clip.title}`,
        })),
      );
    } catch (error) {
      setLastEvent(`素材准备失败：${error.message}`);
    }
  });
  function recordEvent(name, detail = {}, label = '视频') {
    if (name === 'playbacksummary') {
      setSummaries([formatSummary(label, detail), ...summaries()].slice(0, 8));
    } else if (name === 'error') {
      setLastEvent(`${label}：${detail.errMsg || '视频加载失败'}`);
    } else {
      setLastEvent(`${label}：${name}`);
    }
  }
  return {
    src,
    poster,
    players,
    paused,
    visible,
    summaries,
    lastEvent,
    recordEvent,
    togglePaused: () => setPaused(!paused()),
    toggleVisible: () => setVisible(!visible()),
    onVideoEvent: (event) =>
      recordEvent(event.type, event.detail, event.currentTarget.dataset.name),
    onPlaybackSummary: (event) =>
      recordEvent(
        'playbacksummary',
        event.detail,
        event.currentTarget.dataset.name,
      ),
    controlVideo(event) {
      const video = instance.selectComponent(
        event.currentTarget.dataset.target || '#player',
      );
      const action = event.currentTarget.dataset.action;
      if (['play', 'pause', 'stop'].includes(action)) {
        video?.[action]();
      }
    },
    muteAll: () => instance.selectComponent('#group')?.muteAll(),
  };
}
