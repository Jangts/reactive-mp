/** 不依赖小程序全局对象的播放门控接口。 */
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
