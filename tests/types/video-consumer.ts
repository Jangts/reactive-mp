import { defineComponent, definePage } from '@reactive-mp/runtime';
import { computed } from '@reactive-mp/reactivity';
import { useVideo, useVideoGroup, useVideoParticipant, type PlaybackSummaryDetail } from '@reactive-mp/components/video';

defineComponent(({defineProps}) => {
  const props = defineProps({src: String, paused: Boolean});
  const video = useVideo(props, {selector: '#player', emit(name, detail) {
    if (name === 'playbacksummary') {
      const summary = detail as PlaybackSummaryDetail;
      const seconds: number = summary.duration;
      void seconds;
    }
  }});
  video.onTimeUpdate({detail: {currentTime: 1}});
  video.seek(3);
  // @ts-expect-error media positions are numbers
  video.seek('3');
  // @ts-expect-error Hook state is read-only to consumers
  video.state.isPlaying = false;
  return {...video, label: computed(() => `${video.state.currentTime}`)};
});
defineComponent(() => useVideoGroup());
defineComponent(() => useVideoParticipant(() => {}));

definePage(() => useVideo({src: '/demo.mp4'}, {group: false, selector: '#player', emit() {}}));
