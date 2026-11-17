/** 页面通过 useSwiper 控制原生 swiper，单独组合自己的视图。 */
import { definePage } from '../../vendor/reactive-mp/src/index.js';
import { useSwiper } from '../../vendor/swiper/miniprogram/index.js';
import { useSwiperDemo } from '../../hooks/use-swiper-demo.js';
definePage(() => {
  const demo = useSwiperDemo();
  const swiper = useSwiper(
    {
      get items() {
        return demo.items();
      },
      get current() {
        return demo.current();
      },
      circular: true,
    },
    { emit: demo.record },
  );
  return { ...demo, ...swiper };
});
