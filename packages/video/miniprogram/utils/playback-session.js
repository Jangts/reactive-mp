/** 汇总原生播放区间；只记录媒体状态，不解释业务用途或上报数据。 */
export function createPlaybackSession(emit, now = Date.now) {
  let session;
  let activeSince;
  let elapsed = 0;
  function suspend() {
    if (activeSince !== undefined) {
      elapsed += Math.max(0, now() - activeSince);
      activeSince = undefined;
    }
  }
  return {
    start(currentTime) {
      if (!session) {
        session = { startTime: currentTime, currentTime };
        elapsed = 0;
      }
      if (activeSince === undefined) {
        activeSince = now();
      }
    },
    update(currentTime) {
      if (session) {
        session.currentTime = currentTime;
        if (activeSince === undefined) {
          activeSince = now();
        }
      }
    },
    waiting() {
      suspend();
    },
    finish(reason, mediaDuration) {
      if (!session) {
        return;
      }
      suspend();
      const detail = {
        ...session,
        duration: elapsed / 1000,
        mediaDuration,
        reason,
        finished: reason === 'ended',
      };
      session = undefined;
      elapsed = 0;
      emit(detail);
    },
  };
}
