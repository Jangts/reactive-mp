/** 轮播组件、响应式 Hook 与媒体内容的公开合同。 */
import type { Signal } from '@reactive-mp/reactivity';
export type SwiperLayout = 'plain' | 'focus' | 'coverflow';
export interface SwiperProps<T = unknown> {
  items?: readonly T[];
  itemKey?: string;
  current?: number;
  circular?: boolean;
  autoplay?: boolean;
  interval?: number;
  duration?: number;
  disableTouch?: boolean;
  layout?: SwiperLayout;
  peek?: string;
  gap?: string;
  indicator?: boolean;
}
export interface LayoutRule {
  readonly peek: string;
  readonly scale: number;
  readonly rotate: number;
}
export const swiperLayouts: Readonly<Record<SwiperLayout, LayoutRule>>;
export interface SwiperChangeDetail {
  current: number;
  source: string;
}
export interface SwiperEvent<T> {
  detail: T;
  currentTarget?: { dataset: Record<string, unknown> };
}
export interface SwiperMovement {
  dx: number;
  dy?: number;
}
export interface SwiperInstance {
  to(index: number): void;
  next(): void;
  previous(): void;
  refresh(): void;
}
export interface SwiperEntry<T> {
  key: string;
  value: T;
  index: number;
}
export interface SwiperHook<T> extends SwiperInstance {
  current: Signal<number>;
  applied: Signal<number>;
  count: Signal<number>;
  transitioning: Signal<boolean>;
  entries: Signal<SwiperEntry<T>[]>;
  previousMargin: Signal<string>;
  nextMargin: Signal<string>;
  renderOptions: Signal<
    LayoutRule & {
      count: number;
      current: number;
      circular: boolean;
      duration: number;
      revision: number;
    }
  >;
  onChange(event: SwiperEvent<{ current: number; source?: string }>): void;
  onAnimationFinish(
    event: SwiperEvent<{ current: number; source?: string }>,
  ): void;
  onTransitionStart(event: SwiperEvent<SwiperMovement>): void;
  onTransition(event: SwiperEvent<SwiperMovement>): void;
  onItemClick(event: SwiperEvent<{ index: number }>): void;
  onItemEvent(event: {
    detail: unknown;
    currentTarget: { dataset: { index: number | string } };
  }): void;
}
export interface UseSwiperOptions {
  emit?: (name: string, detail: unknown) => void;
}
export function useSwiper<T = unknown>(
  props?: Readonly<SwiperProps<T>>,
  options?: UseSwiperOptions,
): SwiperHook<T>;
export interface SwiperMediaItem {
  id?: string | number;
  type?: 'image' | 'video';
  src: string;
  poster?: string;
  mode?: string;
  muted?: boolean;
  loop?: boolean;
}

export interface MediaSwiperHook<
  T extends SwiperMediaItem,
> extends SwiperInstance {
  mediaItems: Signal<(T & { muted: boolean })[]>;
  mute(): void;
  onChange(event: SwiperEvent<SwiperChangeDetail>): void;
  onAnimationFinish(event: SwiperEvent<SwiperChangeDetail>): void;
  onTransitionStart(event: SwiperEvent<SwiperMovement>): void;
  onItemClick(event: SwiperEvent<{ index: number; active: boolean }>): void;
  onMediaEvent(
    event: SwiperEvent<{
      index: number;
      detail: { type: string; detail: unknown };
    }>,
  ): void;
}
export function useMediaSwiper<T extends SwiperMediaItem>(
  props: Readonly<SwiperProps<T>>,
  options?: UseSwiperOptions & { selector?: string },
): MediaSwiperHook<T>;
