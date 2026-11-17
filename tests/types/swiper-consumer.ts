import { defineComponent, definePage } from '@reactive-mp/runtime';
import { computed } from '@reactive-mp/reactivity';
import { useSwiper, useMediaSwiper, swiperLayouts, type SwiperMediaItem } from '@reactive-mp/swiper';
defineComponent(() => {
  const swiper = useSwiper({items:[{id:'a', name:'A'}], layout:'focus'});
  const name: string = swiper.entries()[0].value.name;
  swiper.to(1);
  // @ts-expect-error indices must be numeric
  swiper.to('1');
  // @ts-expect-error layouts come from the public catalog
  useSwiper({layout:'unknown'});
  return {...swiper, label: computed(() => `${name}:${swiper.current()}`)};
});
definePage(() => useSwiper<SwiperMediaItem>({items:[{type:'video',src:'/demo.mp4'}]}));
const scale: number = swiperLayouts.focus.scale;
void scale;

defineComponent(() => useMediaSwiper({items:[{id:'v',type:'video',src:'/demo.mp4'}]}));
