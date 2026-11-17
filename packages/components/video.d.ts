/** 响应式视频、组件实例与播放事件的公开类型。 */
import type { Signal } from '@reactive-mp/reactivity';
export interface VideoPlaybackTarget {
  play(): void;
  pause(): void;
}
export interface PlaybackController {
  attach(context: VideoPlaybackTarget): void;
  play(): void;
  pause(): void;
  setBlocked(reason: string, blocked: boolean): void;
  nativePlay(): void;
  nativePause(): void;
  dispose(): void;
}
export function createPlaybackController(): PlaybackController;

/** 通过 selectComponent 获取的视频实例公开方法。 */
export interface VideoInstance extends VideoPlaybackTarget {
  stop(): void;
  seek(seconds: number): void;
  seekToPercent(percent: number): void;
  mute(): void;
  setMuted(muted: boolean): void;
  playbackRate(rate: number): void;
  requestFullScreen(options?: { direction?: number }): void;
  exitFullScreen(): void;
  sendDanmu(options: { text: string; color?: string }): void;
  showStatusBar(): void;
  hideStatusBar(): void;
}
export interface VideoGroupInstance {
  muteAll(except?: { mute(): void }): void;
}

/** 一次播放区间的媒体事实，时间单位为秒。 */
export interface PlaybackSummaryDetail {
  startTime: number;
  currentTime: number;
  duration: number;
  mediaDuration: number;
  reason: 'pause' | 'ended' | 'stop' | 'sourcechange' | 'detach' | 'error';
  finished: boolean;
}

/** 可传入 defineProps 返回值、响应式对象或带 getter 的配置对象。 */
export interface VideoProps {
  autoObserve?: boolean;
  intersectionRatio?: number;
  enableProgressTouch?: boolean;
  src?: string;
  duration?: number;
  controls?: boolean;
  danmuList?: unknown[];
  danmuBtn?: boolean;
  enableDanmu?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  paused?: boolean;
  muted?: boolean;
  hideSound?: boolean;
  showCustomPlayBtn?: boolean;
  showCustomProgress?: boolean;
  initialTime?: number;
  pageGesture?: boolean;
  direction?: number;
  showProgress?: boolean;
  showFullscreenBtn?: boolean;
  showPlayBtn?: boolean;
  showCenterPlayBtn?: boolean;
  enableProgressGesture?: boolean;
  objectFit?: string;
  poster?: string;
  stopFrame?: string;
  showMuteBtn?: boolean;
  title?: string;
  playBtnPosition?: string;
  enablePlayGesture?: boolean;
  autoPauseIfNavigate?: boolean;
  autoPauseIfOpenNative?: boolean;
  vslideGesture?: boolean;
  vslideGestureInFullscreen?: boolean;
  customClass?: string;
  customStyle?: string;
  soundStyle?: string;
  playStyle?: string;
  fixedVisible?: boolean;
  canBePaused?: boolean;
  replayCanBePaused?: boolean;
}
export interface VideoState {
  soundOff: boolean;
  showPoster: boolean;
  showStopFrame: boolean;
  mediaDuration: number;
  currentTime: number;
  isPlaying: boolean;
  sliderValue: number;
  isDragging: boolean;
  showCustomPlayBtnForReplay: boolean;
  imageModes: Record<string, string>;
}
export interface UseVideoOptions {
  /** Page 直接使用原生 video 时设为 false；组件默认参与祖先分组。 */
  group?: boolean;
  selector?: string;
  progressSelector?: string;
  emit?: (name: string, detail: unknown) => void;
}
export interface VideoEvent<T = unknown> {
  detail: T;
}
export interface VideoHandlers {
  onPlay(event: VideoEvent): void;
  onPause(event: VideoEvent): void;
  onEnded(event: VideoEvent): void;
  onWaiting(event: VideoEvent): void;
  onError(event: VideoEvent): void;
  onLoadedMetadata(event: VideoEvent<{ duration: number }>): void;
  onTimeUpdate(event: VideoEvent<{ currentTime: number }>): void;
  onFullscreenChange(event: VideoEvent): void;
  onProgress(event: VideoEvent): void;
  onControlsToggle(event: VideoEvent): void;
  onSeekComplete(event: VideoEvent): void;
  onSoundToggle(): void;
  onVideoPlayToggle(): void;
  onTapVideo(): void;
  onProgressTouchStart(): void;
  onProgressTouchMove(event: VideoTouchEvent): void;
  onProgressTouchEnd(event: VideoTouchEvent): void;
  onProgressTouchCancel(): void;
}
export interface VideoTouchEvent {
  touches?: { clientX: number }[];
  changedTouches?: { clientX: number }[];
}
export type VideoBindings = {
  readonly [K in keyof VideoState]: Signal<VideoState[K]>;
};
export type VideoHook = VideoBindings &
  VideoInstance &
  VideoHandlers & {
    readonly state: Readonly<VideoState>;
  };
/** 在响应式 setup 中调用，自动连接生命周期和原生视频上下文。 */
export function useVideo(
  props?: Readonly<VideoProps>,
  options?: UseVideoOptions,
): VideoHook;
export function useVideoGroup(): VideoGroupInstance & {
  memberCount: Signal<number>;
};
export function useVideoParticipant(mute: () => void): {
  mute(): void;
  activateSound(): void;
};
