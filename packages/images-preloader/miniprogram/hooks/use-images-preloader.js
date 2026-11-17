/** 图片预加载的响应式组合入口，宿主就绪和卸载统一交给 runtime 生命周期。 */
import { useSignal } from '@reactive-mp/reactivity';
import { onReady, onUnmounted } from '@reactive-mp/runtime';
import { createImagesPreloader } from '../utils/preloader.js';

/** 在 setup 中调用；返回活动节点、原生事件处理器及 loadImages 方法。 */
export function useImagesPreloader() {
  const [images, setImages] = useSignal([]);
  const controller = createImagesPreloader(setImages);
  onReady(controller.ready);
  onUnmounted(controller.dispose);
  const { loadImages, onImageLoad, onImageError } = controller;
  return { images, loadImages, onImageLoad, onImageError };
}
