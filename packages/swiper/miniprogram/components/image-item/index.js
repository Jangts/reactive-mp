/** 默认图片内容组件，仅约定 src 和可选 mode，不决定轮播版式。 */
import { defineComponent } from '@reactive-mp/runtime';
defineComponent(({ defineProps }) => {
  defineProps({ item: Object, index: Number, active: Boolean });
  return {};
});
