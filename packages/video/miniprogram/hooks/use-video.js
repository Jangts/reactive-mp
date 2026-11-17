/** 响应式视频 Hook，统一管理播放状态、原生资源与生命周期。 */
import { reactive, computed, watch } from '@reactive-mp/reactivity';
import {
  useCurrentInstance,
  onReady,
  onHide,
  onShow,
  onUnmounted,
} from '@reactive-mp/runtime';
import { createPlaybackController } from '../utils/controller.js';
import { createPlaybackSession } from '../utils/playback-session.js';
import { useVideoParticipant } from './use-video-group.js';
import { properties } from '../utils/properties.js';

export function useVideo(input = {}, options = {}) {
  const instance = useCurrentInstance();
  const props = {};
  for (const [key, schema] of Object.entries(properties)) {
    Object.defineProperty(props, key, {
      get: () => input[key] ?? schema.value,
    });
  }
  const state = reactive({
    soundOff: props.muted,
    showPoster: true,
    showStopFrame: false,
    mediaDuration: 0,
    currentTime: 0,
    isPlaying: false,
    sliderValue: 0,
    isDragging: false,
    showCustomPlayBtnForReplay: false,
    imageModes: {
      fill: 'scaleToFill',
      contain: 'aspectFit',
      cover: 'aspectFill',
    },
  });
  let player, observer;
  let disposed = false,
    ready = false,
    sourceChanging = false,
    replaying = false;
  const emit = (name, detail) => {
    if (options.emit) {
      options.emit(name, detail);
    } else {
      instance?.triggerEvent?.(name, detail);
    }
  };
  const query = () =>
    instance.createSelectorQuery
      ? instance.createSelectorQuery()
      : wx.createSelectorQuery().in(instance);
  const update = (value) => {
    if (!disposed) {
      Object.assign(state, value);
    }
  };
  const playback = createPlaybackController();
  const session = createPlaybackSession((detail) =>
    emit('playbacksummary', detail),
  );
  const mute = () => update({ soundOff: true });
  const participant =
    options.group === false
      ? { mute, activateSound() {} }
      : useVideoParticipant(mute);
  const methods = {
    play() {
      playback?.play();
    },
    pause() {
      playback?.pause();
    },
    stop() {
      methods.finishPlayback('stop');
      methods.pause();
      player?.stop();
    },
    seek(position) {
      player?.seek(position);
    },
    setMuted(muted) {
      update({ soundOff: muted });
      if (!muted) {
        participant.activateSound();
      }
    },
    onSoundToggle() {
      methods.setMuted(!state.soundOff);
      emit('mutedchange', { muted: state.soundOff });
      if (!state.soundOff) {
        emit('soundon');
      }
    },
    finishPlayback(reason) {
      session?.finish(reason, state.mediaDuration || props.duration);
    },
    onWaiting(e) {
      session.waiting();
      emit('waiting', e.detail);
    },
    onError(e) {
      methods.finishPlayback('error');
      methods.pause();
      update({ isPlaying: false });
      emit('error', e.detail);
    },
    onPlay(e) {
      session.start(state.currentTime);
      playback.nativePlay();
      update({ isPlaying: true, showCustomPlayBtnForReplay: false });
      emit('play', e.detail);
    },
    onPause(e) {
      methods.finishPlayback('pause');
      if (!sourceChanging) {
        playback.nativePause();
      }
      update({ isPlaying: false });
      emit('pause', e.detail);
    },
    onEnded(e) {
      session.update(
        state.mediaDuration || props.duration || state.currentTime,
      );
      methods.finishPlayback('ended');
      if (!props.loop) {
        methods.pause();
      }
      update({
        isPlaying: false,
        showPoster: !props.loop && !props.stopFrame,
        showStopFrame: !props.loop && !!props.stopFrame,
        showCustomPlayBtnForReplay: !props.loop,
      });
      emit('ended', e.detail);
    },
    onLoadedMetadata(e) {
      sourceChanging = false;
      if (player) {
        playback.attach(player);
      }
      update({ mediaDuration: e.detail.duration });
      emit('loadedmetadata', e.detail);
    },
    onTimeUpdate(e) {
      const currentTime = e.detail.currentTime;
      session.update(currentTime);
      const duration = state.mediaDuration || props.duration;
      const next = { currentTime };
      if (currentTime > 0.01) {
        next.showPoster = false;
        next.showStopFrame = false;
      }
      if (!state.isDragging) {
        next.sliderValue =
          duration > 0
            ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
            : 0;
      }
      update(next);
      emit('timeupdate', e.detail);
    },
    onVideoPlayToggle() {
      if (state.isPlaying) {
        if (props.canBePaused || (replaying && props.replayCanBePaused)) {
          methods.pause();
        }
      } else {
        replaying = state.showCustomPlayBtnForReplay;
        methods.play();
      }
    },
    onTapVideo() {
      if (
        props.showCustomPlayBtn ||
        state.showCustomPlayBtnForReplay ||
        replaying
      ) {
        methods.onVideoPlayToggle();
      }
    },
    onProgressTouchStart() {
      if (props.enableProgressTouch) {
        update({ isDragging: true });
      }
    },
    updateProgress(e, seek) {
      const touch = (seek ? e.changedTouches : e.touches)?.[0];
      if (!touch || !state.isDragging) {
        return;
      }
      query()
        .select(options.progressSelector || '.progress-container')
        .boundingClientRect((rect) => {
          if (!rect?.width || disposed) {
            return;
          }
          const percent = Math.max(
            0,
            Math.min(1, (touch.clientX - rect.left) / rect.width),
          );
          update({ sliderValue: percent * 100 });
          if (seek) {
            methods.seekToPercent(percent);
          }
        })
        .exec();
    },
    onProgressTouchMove(e) {
      methods.updateProgress(e, false);
    },
    onProgressTouchEnd(e) {
      methods.updateProgress(e, true);
      update({ isDragging: false });
    },
    onProgressTouchCancel() {
      update({ isDragging: false });
    },
    seekToPercent(percent) {
      if (!Number.isFinite(percent)) {
        return;
      }
      const bounded = Math.max(0, Math.min(1, percent));
      methods.seek(bounded * (state.mediaDuration || props.duration));
      update({ sliderValue: bounded * 100 });
    },
  };
  const forwardedEvents = {
    fullscreenchange: 'onFullscreenChange',
    progress: 'onProgress',
    controlstoggle: 'onControlsToggle',
    seekcomplete: 'onSeekComplete',
  };
  for (const [event, handler] of Object.entries(forwardedEvents)) {
    methods[handler] = (e) => emit(event, e.detail);
  }
  for (const method of [
    'sendDanmu',
    'playbackRate',
    'requestFullScreen',
    'exitFullScreen',
    'showStatusBar',
    'hideStatusBar',
  ]) {
    methods[method] = (...args) => player?.[method](...args);
  }
  function observeVisibility() {
    observer?.disconnect();
    playback.setBlocked('visibility', props.autoObserve && !props.fixedVisible);
    if (!props.autoObserve || props.fixedVisible) {
      return;
    }
    const threshold = Math.max(0, Math.min(1, props.intersectionRatio));
    const observerOptions = { thresholds: [threshold] };
    observer = instance.createIntersectionObserver
      ? instance.createIntersectionObserver(observerOptions)
      : wx.createIntersectionObserver(instance, observerOptions);
    observer
      .relativeToViewport()
      .observe(options.selector || '#c-video', (result) => {
        if (!disposed) {
          playback.setBlocked(
            'visibility',
            result.intersectionRatio <= threshold,
          );
        }
      });
  }
  watch(
    () => props.paused,
    (value) => playback.setBlocked('external', value),
    { immediate: true },
  );
  watch(
    () => props.muted,
    (value) => methods.setMuted(value),
  );
  watch(
    () => props.src,
    () => {
      methods.finishPlayback('sourcechange');
      sourceChanging = true;
      replaying = false;
      update({
        showPoster: true,
        isPlaying: false,
        showStopFrame: false,
        mediaDuration: 0,
        currentTime: 0,
        sliderValue: 0,
        showCustomPlayBtnForReplay: false,
      });
    },
  );
  watch(
    [
      () => props.autoObserve,
      () => props.fixedVisible,
      () => props.intersectionRatio,
    ],
    () => {
      if (ready) {
        observeVisibility();
      }
    },
  );
  onReady(() => {
    ready = true;
    playback.setBlocked('external', props.paused);
    methods.setMuted(props.muted);
    observeVisibility();
    if (props.autoplay) {
      methods.play();
    }
    query()
      .select(options.selector || '#c-video')
      .fields({ id: true }, (result) => {
        if (disposed) {
          return;
        }
        if (!result?.id) {
          emit('error', { errMsg: 'Video node must exist and have an id' });
          return;
        }
        player = wx.createVideoContext(result.id, instance);
        playback.attach(player);
      })
      .exec();
  });
  onHide(() => playback.setBlocked('page', true));
  onShow(() => playback.setBlocked('page', false));
  onUnmounted(() => {
    methods.finishPlayback('detach');
    disposed = true;
    observer?.disconnect();
    playback.dispose();
    player = undefined;
  });
  for (const [name, method] of Object.entries(methods)) {
    methods[name] = (...args) => {
      if (!disposed) {
        return method(...args);
      }
    };
  }
  return {
    state,
    ...Object.fromEntries(
      Object.keys(state).map((key) => [key, computed(() => state[key])]),
    ),
    ...methods,
    mute: participant.mute,
  };
}
