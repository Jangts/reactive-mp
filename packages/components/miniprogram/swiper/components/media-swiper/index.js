/** 媒体轮播入口将声音协调与通用轮播版式组合。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useMediaSwiper } from '../../hooks/use-media-swiper.js';
import { swiperProperties } from '../../utils/properties.js';
defineComponent(({ defineProps, defineOptions }) => {
  defineOptions({ multipleSlots: true });
  return useMediaSwiper(defineProps(swiperProperties));
});
