import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackSession } from '../packages/video/miniprogram/playback-session.js';

test('playback summaries exclude known buffering and do not equate seeking with viewing', () => {
  let time = 0;
  const events = [];
  const session = createPlaybackSession(detail => events.push(detail), () => time);
  session.finish('detach', 100);
  assert.equal(events.length, 0);
  session.start(0);
  time = 1000; session.waiting();
  time = 5000; session.update(80);
  time = 6000; session.finish('pause', 100);
  session.finish('detach', 100);
  assert.deepEqual(events, [{ startTime: 0, currentTime: 80, duration: 2, mediaDuration: 100, reason: 'pause', finished: false }]);
  session.start(80);
  time = 7000; session.update(100); session.finish('ended', 100);
  assert.equal(events[1].finished, true);
  assert.equal(events[1].duration, 1);
});
test('stop, source replacement, errors and detach finish active intervals exactly once', () => {
  for (const reason of ['stop', 'sourcechange', 'error', 'detach']) {
    let time = 0; const events = [];
    const session = createPlaybackSession(detail => events.push(detail), () => time);
    session.start(3); session.start(3);
    time = 300; session.finish(reason, 10); session.finish('pause', 10);
    assert.equal(events.length, 1);
    assert.equal(events[0].reason, reason);
    assert.equal(events[0].finished, false);
    assert.equal(events[0].duration, 0.3);
  }
});
