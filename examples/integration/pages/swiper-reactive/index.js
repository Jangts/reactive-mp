/** Reactive 页面将自定义卡片放入轮播容器，版式由容器统一提供。 */
import { definePage } from '../../vendor/reactive-mp/src/index.js';
import { useSwiperDemo } from '../../hooks/use-swiper-demo.js';
definePage(() => useSwiperDemo());
