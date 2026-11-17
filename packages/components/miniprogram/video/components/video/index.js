/** 可直接在 WXML 使用的视频组件，状态和行为由 useVideo 提供。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useVideo } from '../../hooks/use-video.js';
import { properties } from '../../utils/properties.js';
defineComponent(({ defineProps, defineOptions, extClasses }) => {
  const props = defineProps(properties);
  defineOptions({ multipleSlots: true });
  extClasses('custom-class');
  const { state, ...bindings } = useVideo(props);
  return bindings;
});
