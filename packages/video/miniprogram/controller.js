/** 协调播放意图与暂时阻塞，不因离屏或页面隐藏覆盖用户选择。 */
export function createPlaybackController() {
  let wanted = false;
  let player;
  let disposed = false;
  let commanded;
  const blockers = new Set();
  function sync(force = false) {
    if (!player || disposed) {
      return;
    }
    const playing = wanted && blockers.size === 0;
    if (force || commanded !== playing) {
      commanded = playing;
      if (playing) {
        player.play();
      } else {
        player.pause();
      }
    }
  }
  return {
    attach(context) {
      player = context;
      commanded = undefined;
      sync();
    },
    play() {
      wanted = true;
      sync();
    },
    pause() {
      wanted = false;
      sync();
    },
    setBlocked(reason, blocked) {
      if (blocked) {
        blockers.add(reason);
      } else {
        blockers.delete(reason);
      }
      sync();
    },
    nativePlay() {
      if (blockers.size) {
        sync(true);
      } else {
        wanted = true;
        commanded = true;
      }
    },
    nativePause() {
      if (!blockers.size && commanded !== false) {
        wanted = false;
        commanded = false;
      }
    },
    dispose() {
      disposed = true;
      player = undefined;
    },
  };
}
