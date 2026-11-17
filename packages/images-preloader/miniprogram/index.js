/** 图片预加载包的公开入口，不在导入时注册原生组件或启动请求。 */
export { useImagesPreloader } from './hooks/use-images-preloader.js';
export {
  getLoadedImageSizeByUrl,
  clearImageCache,
} from './utils/image-pool.js';
