/** 图片预加载组件与 Hook 的公开合同；时长单位毫秒，尺寸单位 px。 */
import type { Signal } from '@reactive-mp/reactivity';

export interface ImageSize {
  width: number;
  height: number;
}
export type ImagePreloadResult = { src: string } & (
  | ({ status: 'loaded' } & ImageSize)
  | { status: 'error'; errMsg: string }
  | { status: 'timeout' | 'cancelled' }
);
export interface ImagesPreloadReport {
  total: number;
  done: number;
  fail: number;
  results: ImagePreloadResult[];
}
export interface ImagesPreloadOptions {
  /** true 时在宿主 ready 后启动；已经 ready 则立即启动。 */
  delay?: boolean;
  /** 从实际启动加载开始计时，0 表示不设置超时，默认 0。 */
  timeout?: number;
}
export interface ImagesPreloaderInstance {
  loadImages(
    images: readonly (string | null | undefined | false)[],
    options?: ImagesPreloadOptions,
  ): Promise<ImagesPreloadReport>;
}
export interface PreloadImage {
  id: number;
  src: string;
}
export interface ImagePreloadEvent<T> {
  currentTarget: { dataset: { id: number | string } };
  detail: T;
}
export interface ImagesPreloaderHook extends ImagesPreloaderInstance {
  images: Signal<PreloadImage[]>;
  onImageLoad(event: ImagePreloadEvent<ImageSize>): void;
  onImageError(event: ImagePreloadEvent<{ errMsg?: string }>): void;
}
export function useImagesPreloader(): ImagesPreloaderHook;
/** 缓存未命中返回 {}，不触发请求。 */
export function getLoadedImageSizeByUrl(src: string): Partial<ImageSize>;
/** 只清除成功元数据，不保证删除微信自身的图片缓存。 */
export function clearImageCache(src?: string): void;
