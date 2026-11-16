/** 原生视频的播放门控、媒体封面和可替换控件，不依赖应用全局状态。 */
import { createPlaybackSession } from '../playback-session.js';
import { properties } from './properties.js';
import { createPlaybackController } from '../controller.js';
import { getVideoParticipantBehavior } from '../participant.js';
const forwardedEvents = {
  fullscreenchange: 'onFullscreenChange',
  progress: 'onProgress',
  controlstoggle: 'onControlsToggle',
  seekcomplete: 'onSeekComplete',
};
const nativeMethods = [
  'sendDanmu',
  'playbackRate',
  'requestFullScreen',
  'exitFullScreen',
  'showStatusBar',
  'hideStatusBar',
];
const methods = {
  play() {
    this._playback?.play();
  },
  pause() {
    this._playback?.pause();
  },
  stop() {
    this.finishPlayback('stop');
    this.pause();
    this._video?.stop();
  },
  seek(position) {
    this._video?.seek(position);
  },
  setMuted(muted) {
    this.setData({ soundOff: muted });
    if (!muted) {
      this._videoGroup?.muteAll(this);
    }
  },
  onSoundToggle() {
    this.setMuted(!this.data.soundOff);
    this.triggerEvent('mutedchange', { muted: this.data.soundOff });
    if (!this.data.soundOff) {
      this.triggerEvent('soundon');
    }
  },
  finishPlayback(reason) {
    this._session?.finish(
      reason,
      this.data.mediaDuration || this.data.duration,
    );
  },
  onWaiting(e) {
    this._session.waiting();
    this.triggerEvent('waiting', e.detail);
  },
  onError(e) {
    this.finishPlayback('error');
    this.triggerEvent('error', e.detail);
  },
  onPlay(e) {
    this._session.start(this.data.currentTime);
    this._playback.nativePlay();
    this.setData({ isPlaying: true, showCustomPlayBtnForReplay: false });
    this.triggerEvent('play', e.detail);
  },
  onPause(e) {
    this.finishPlayback('pause');
    if (!this._sourceChanging) {
      this._playback.nativePause();
    }
    this.setData({ isPlaying: false });
    this.triggerEvent('pause', e.detail);
  },
  onEnded(e) {
    this._session.update(
      this.data.mediaDuration || this.data.duration || this.data.currentTime,
    );
    this.finishPlayback('ended');
    if (!this.data.loop) {
      this.pause();
    }
    this.setData({
      isPlaying: false,
      showPoster: !this.data.loop && !this.data.stopFrame,
      showStopFrame: !this.data.loop && !!this.data.stopFrame,
      showCustomPlayBtnForReplay: !this.data.loop,
    });
    this.triggerEvent('ended', e.detail);
  },
  onLoadedMetadata(e) {
    this._sourceChanging = false;
    if (this._video) {
      this._playback.attach(this._video);
    }
    this.setData({ mediaDuration: e.detail.duration });
    this.triggerEvent('loadedmetadata', e.detail);
  },
  onTimeUpdate(e) {
    const currentTime = e.detail.currentTime;
    this._session.update(currentTime);
    const duration = this.data.mediaDuration || this.data.duration;
    const update = { currentTime };
    if (currentTime > 0.01) {
      update.showPoster = false;
      update.showStopFrame = false;
    }
    if (!this.data.isDragging) {
      update.sliderValue =
        duration > 0
          ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
          : 0;
    }
    this.setData(update);
    this.triggerEvent('timeupdate', e.detail);
  },
  onVideoPlayToggle() {
    if (this.data.isPlaying) {
      if (
        this.data.canBePaused ||
        (this._replaying && this.data.replayCanBePaused)
      ) {
        this.pause();
      }
    } else {
      this._replaying = this.data.showCustomPlayBtnForReplay;
      this.play();
    }
  },
  onTapVideo() {
    if (
      this.data.showCustomPlayBtn ||
      this.data.showCustomPlayBtnForReplay ||
      this._replaying
    ) {
      this.onVideoPlayToggle();
    }
  },
  onProgressTouchStart() {
    if (this.data.enableProgressTouch) {
      this.setData({ isDragging: true });
    }
  },
  updateProgress(e, seek) {
    const touch = (seek ? e.changedTouches : e.touches)?.[0];
    if (!touch || !this.data.isDragging) {
      return;
    }
    this.createSelectorQuery()
      .select('.progress-container')
      .boundingClientRect((rect) => {
        if (!rect?.width || this._disposed) {
          return;
        }
        const percent = Math.max(
          0,
          Math.min(1, (touch.clientX - rect.left) / rect.width),
        );
        this.setData({ sliderValue: percent * 100 });
        if (seek) {
          this.seekToPercent(percent);
        }
      })
      .exec();
  },
  onProgressTouchMove(e) {
    this.updateProgress(e, false);
  },
  onProgressTouchEnd(e) {
    this.updateProgress(e, true);
    this.setData({ isDragging: false });
  },
  onProgressTouchCancel() {
    this.setData({ isDragging: false });
  },
  seekToPercent(percent) {
    if (!Number.isFinite(percent)) {
      return;
    }
    const bounded = Math.max(0, Math.min(1, percent));
    this.seek(bounded * (this.data.mediaDuration || this.data.duration));
    this.setData({ sliderValue: bounded * 100 });
  },
};
for (const [event, handler] of Object.entries(forwardedEvents)) {
  methods[handler] = function (e) {
    this.triggerEvent(event, e.detail);
  };
}
for (const method of nativeMethods) {
  methods[method] = function (...args) {
    return this._video?.[method](...args);
  };
}
Component({
  options: { multipleSlots: true },
  externalClasses: ['custom-class'],
  properties,
  behaviors: [getVideoParticipantBehavior()],
  relations: {
    '../group/index': {
      type: 'ancestor',
      linked(group) {
        this._videoGroup = group;
        if (!this.data.soundOff) {
          group.muteAll(this);
        }
      },
      unlinked(group) {
        if (this._videoGroup === group) {
          this._videoGroup = undefined;
        }
      },
    },
  },
  data: {
    soundOff: true,
    showPoster: true,
    showStopFrame: false,
    imageModes: {
      fill: 'scaleToFill',
      contain: 'aspectFit',
      cover: 'aspectFill',
    },
    mediaDuration: 0,
    currentTime: 0,
    isPlaying: false,
    sliderValue: 0,
    isDragging: false,
    showCustomPlayBtnForReplay: false,
  },
  observers: {
    'autoObserve, fixedVisible, intersectionRatio'() {
      if (this._ready) {
        this.observeVisibility();
      }
    },
    src() {
      this.finishPlayback('sourcechange');
      this._sourceChanging = true;
      this._replaying = false;
      this.setData({
        showPoster: true,
        isPlaying: false,
        showStopFrame: false,
        mediaDuration: 0,
        currentTime: 0,
        sliderValue: 0,
        showCustomPlayBtnForReplay: false,
      });
    },
  },
  methods: {
    ...methods,
    observeVisibility() {
      this._observer?.disconnect();
      this._playback.setBlocked(
        'visibility',
        this.data.autoObserve && !this.data.fixedVisible,
      );
      if (!this.data.autoObserve || this.data.fixedVisible) {
        return;
      }
      const threshold = Math.max(0, Math.min(1, this.data.intersectionRatio));
      this._observer = this.createIntersectionObserver({
        thresholds: [threshold],
      });
      this._observer.relativeToViewport().observe('.c-video', (result) => {
        if (!this._disposed) {
          this._playback.setBlocked(
            'visibility',
            result.intersectionRatio <= threshold,
          );
        }
      });
    },
  },
  lifetimes: {
    created() {
      this._playback = createPlaybackController();
      this._session = createPlaybackSession((detail) =>
        this.triggerEvent('playbacksummary', detail),
      );
    },
    ready() {
      this._ready = true;
      this._playback.setBlocked('external', this.data.paused);
      this.setMuted(this.data.muted);
      this.observeVisibility();
      if (this.data.autoplay) {
        this.play();
      }
      this.createSelectorQuery()
        .select('#c-video')
        .context((result) => {
          if (!this._disposed && result?.context) {
            this._video = result.context;
            this._playback.attach(this._video);
          }
        })
        .exec();
    },
    detached() {
      this.finishPlayback('detach');
      this._disposed = true;
      this._observer?.disconnect();
      this._playback.dispose();
      this._video = undefined;
    },
  },
  pageLifetimes: {
    hide() {
      this._playback.setBlocked('page', true);
    },
    show() {
      this._playback.setBlocked('page', false);
    },
  },
});
