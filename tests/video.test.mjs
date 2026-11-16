import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackController } from '../packages/video/miniprogram/controller.js';

test('video preserves intent across multiple blockers and asynchronous context readiness', () => {
  const calls = [];
  const c = createPlaybackController();
  c.setBlocked('visibility', true); c.play();
  c.attach({ play() { calls.push('play'); }, pause() { calls.push('pause'); } });
  c.setBlocked('page', true); c.setBlocked('visibility', false);
  assert.deepEqual(calls, ['pause']);
  c.setBlocked('page', false);
  assert.deepEqual(calls, ['pause', 'play']);
  c.pause(); c.setBlocked('visibility', true); c.setBlocked('visibility', false);
  assert.deepEqual(calls, ['pause', 'play', 'pause']);
  c.dispose(); c.play(); assert.equal(calls.length, 3);
});
test('native controls preserve user pause while automatic pause preserves intent', () => {
  const calls = []; const c = createPlaybackController();
  c.attach({ play() { calls.push('play'); }, pause() { calls.push('pause'); } });
  c.play(); c.setBlocked('external', true); c.nativePause(); c.setBlocked('external', false);
  assert.equal(calls.at(-1), 'play');
  const before = calls.length;
  c.nativePause(); c.setBlocked('page', true); c.setBlocked('page', false);
  assert.equal(calls.length, before);
  c.setBlocked('external', true); c.nativePlay();
  assert.equal(calls.at(-1), 'pause');
});
test('group scopes sound control and removes detached participants', async () => {
  globalThis.Behavior = options => options;
  let definition;
  globalThis.Component = options => { definition = options; };
  try {
    await import('../packages/video/miniprogram/group/index.js');
    const group = { ...definition.methods };
    definition.lifetimes.created.call(group);
    const relation = definition.relations.participant;
    let a = 0, b = 0;
    const first = { mute() { a++; } }, second = { mute() { b++; } };
    relation.linked.call(group, first); relation.linked.call(group, second);
    group.muteAll(first); assert.equal(a, 0); assert.equal(b, 1);
    relation.unlinked.call(group, second); group.muteAll();
    assert.equal(a, 1); assert.equal(b, 1); assert.equal(second._videoGroup, undefined);
    definition.lifetimes.detached.call(group);
    assert.equal(first._videoGroup, undefined); assert.equal(group._members.size, 0);
  } finally { delete globalThis.Behavior; delete globalThis.Component; }
});
test('video component starts after context readiness, gates visibility and clamps seeking', async () => {
  globalThis.Behavior = options => options;
  let definition;
  globalThis.Component = options => { definition = options; };
  try {
    await import('../packages/video/miniprogram/video/index.js');
    const calls = [];
    const player = { play() { calls.push('play'); }, pause() { calls.push('pause'); }, seek(time) { calls.push(time); } };
    let ready, visibility;
    const instance = {
      data: { ...Object.fromEntries(Object.entries(definition.properties).map(([key, value]) => [key, value.value])), ...definition.data, autoplay: true, mediaDuration: 60 },
      ...definition.methods,
      setData(update) { Object.assign(this.data, update); },
      triggerEvent() {},
      createSelectorQuery() { return { select() { return this; }, context(fn) { ready = () => fn({context: player}); return this; }, exec() {} }; },
      createIntersectionObserver() { return { relativeToViewport() { return this; }, observe(selector, fn) { visibility = fn; }, disconnect() {} }; },
    };
    definition.lifetimes.created.call(instance);
    definition.lifetimes.ready.call(instance);
    visibility({ intersectionRatio: 1 }); assert.deepEqual(calls, []);
    ready(); assert.deepEqual(calls, ['play']);
    instance.pause(); visibility({intersectionRatio: 0}); visibility({intersectionRatio: 1});
    assert.deepEqual(calls, ['play', 'pause']);
    instance.seekToPercent(2); assert.equal(calls.at(-1), 60);
    instance.seekToPercent(-1); assert.equal(calls.at(-1), 0);
    definition.lifetimes.detached.call(instance);
    visibility({intersectionRatio: 1}); assert.equal(calls.at(-1), 0);
  } finally { delete globalThis.Behavior; delete globalThis.Component; }
});
