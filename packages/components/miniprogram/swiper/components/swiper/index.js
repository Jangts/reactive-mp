/** 原生组件入口复用轮播 Hook，视觉包装由容器统一承担。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useSwiper } from '../../hooks/use-swiper.js';
import { swiperProperties } from '../../utils/properties.js';
defineComponent(({ defineProps, defineOptions }) => {
  const props = defineProps(swiperProperties);
  defineOptions({ multipleSlots: true });
  const { current, ...bindings } = useSwiper(props);
  return { ...bindings, swiperCurrent: current };
});
