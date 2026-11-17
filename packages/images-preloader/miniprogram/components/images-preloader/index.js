/** 原生隐藏图片组件，只负责装配预加载 Hook 与原生 image 模板。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useImagesPreloader } from '../../hooks/use-images-preloader.js';

defineComponent(() => useImagesPreloader());
