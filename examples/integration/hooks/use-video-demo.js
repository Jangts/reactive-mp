/** Reactive 演示页面共享的外部属性控制与事件列表。 */
import {
  useSignal,
  useCurrentInstance,
} from '../vendor/reactive-mp/src/index.js';
import { media, formatSummary } from '../utils/video-demo.js';
export function useVideoDemo() {
  const instance = useCurrentInstance();
  const [paused, setPaused] = useSignal(false);
  const [visible, setVisible] = useSignal(true);
  const [summaries, setSummaries] = useSignal([]);
  const [lastEvent, setLastEvent] = useSignal('等待操作');
  function recordEvent(name, detail, label = '视频') {
    if (name === 'playbacksummary') {
      setSummaries([formatSummary(label, detail), ...summaries()].slice(0, 8));
    } else if (name === 'error') {
      setLastEvent(`${label}：${detail.errMsg || '视频加载失败'}`);
    } else {
      setLastEvent(`${label}：${name}`);
    }
  }
  return {
    ...media,
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
