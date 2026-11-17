/** 可选媒体内容适配：仅激活项播放视频，声音协调交给视频包。 */
import { defineComponent } from '@reactive-mp/runtime';
defineComponent(({ defineProps, $emit }) => {
  defineProps({ item: Object, index: Number, active: Boolean });
  return {
    onSoundOn: (event) =>
      $emit('itemevent', { type: 'soundon', detail: event.detail }),
    onMutedChange: (event) =>
      $emit('itemevent', { type: 'mutedchange', detail: event.detail }),
    onPlaybackSummary: (event) =>
      $emit('itemevent', { type: 'playbacksummary', detail: event.detail }),
    onError: (event) =>
      $emit('itemevent', { type: 'error', detail: event.detail }),
  };
});
