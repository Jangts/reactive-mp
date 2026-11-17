/** 任意内容卡片只展示数据与激活状态，不实现轮播缩放或旋转。 */
import { defineComponent } from '../../vendor/reactive-mp/src/index.js';
defineComponent(({ defineProps }) => {
  defineProps({ item: Object, index: Number, active: Boolean });
  return {};
});
