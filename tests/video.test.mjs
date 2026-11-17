import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackController } from '../packages/video/miniprogram/utils/controller.js';

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

// Use the actual runtime lifecycle and binder, with only native platform surfaces mocked.
globalThis.Behavior = options => options;
let registered;
const nativeContexts = new WeakMap();
const createVideoContext = (id, owner) => {
  assert.equal(typeof id, 'string');
  return nativeContexts.get(owner);
};
globalThis.wx = { createVideoContext };
globalThis.Component = options => { registered = options; };
await import('../packages/video/miniprogram/components/group/index.js');
const groupDefinition = registered;
await import('../packages/video/miniprogram/components/video/index.js');
const videoDefinition = registered;
const { defineComponent, definePage } = await import('@reactive-mp/runtime');
const { useVideo, useVideoGroup, useVideoParticipant } = await import('@reactive-mp/video');
const { computed } = await import('@reactive-mp/reactivity');
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
function mount(definition, props = {}) {
  const defaults = Object.fromEntries(Object.entries(definition.properties || {}).map(([name, schema]) => [name, schema.value]));
  const calls = [], events = [];
  let contextReady, visibility, disconnected = false;
  let nativeQueries = 0;
  const context = { play() { calls.push('play'); }, pause() { calls.push('pause'); }, stop() { calls.push('stop'); }, seek(value) { calls.push(value); } };
  const instance = {
    data: { ...defaults, ...definition.data }, properties: { ...defaults, ...props },
    getPageId: () => 'video-test', selectOwnerComponent: () => null,
    setData(update, callback) { Object.assign(this.data, update); callback?.(); },
    triggerEvent(name, detail) { events.push({name, detail}); },
    createSelectorQuery() {
      nativeQueries++;
      return { select() { return this; }, fields(options, fn) { assert.equal(options.id, true); contextReady = () => fn({id:'player'}); return this; }, exec() {} };
    },
    createIntersectionObserver() { return { relativeToViewport() { return this; }, observe(selector, fn) { visibility = fn; }, disconnect() { disconnected = true; } }; },
  };
  nativeContexts.set(instance, context);
  Object.assign(instance, definition.methods || Object.fromEntries(
    Object.entries(definition).filter(([, value]) => typeof value === 'function'),
  ));
  for (const behavior of definition.behaviors || []) { behavior.lifetimes?.created?.call(instance); }
  assert.equal(nativeQueries, 0, 'setup must not query native views');
  for (const behavior of definition.behaviors || []) { behavior.lifetimes?.attached?.call(instance); }
  definition.lifetimes?.attached?.call(instance);
  definition.onLoad?.call(instance);
  return {
    instance, calls, events,
    ready() { definition.lifetimes?.ready?.call(instance); definition.onReady?.call(instance); },
    contextReady() { contextReady(); },
    visibility(ratio) { visibility({intersectionRatio: ratio}); },
    updateProps(values) {
      Object.assign(instance.properties, values);
      for (const behavior of definition.behaviors || []) { behavior.observers?.['**']?.call(instance); }
    },
    detach() { definition.lifetimes?.detached?.call(instance); definition.onUnload?.call(instance); },
    get disconnected() { return disconnected; },
  };
}
function connect(group, child, childDefinition = videoDefinition) {
  groupDefinition.relations.participant.linked.call(group.instance, child.instance);
  childDefinition.relations['video-group'].linked.call(child.instance, group.instance);
}

test('ordinary video retains native usage, reactive view bindings and public methods', async () => {
  const video = mount(videoDefinition, { autoplay: true });
  video.ready(); video.visibility(1);
  assert.deepEqual(video.calls, []);
  video.contextReady(); assert.deepEqual(video.calls, ['play']);
  video.instance.onPlay({detail: {}}); await tick();
  assert.equal(video.instance.data.isPlaying, true);
  video.instance.onLoadedMetadata({detail: {duration: 60}});
  video.instance.onTimeUpdate({detail: {currentTime: 30}}); await tick();
  assert.equal(video.instance.data.sliderValue, 50);
  video.instance.seekToPercent(2); assert.equal(video.calls.at(-1), 60);
  video.instance.pause(); video.instance.onPause({detail: {}});
  video.visibility(0); video.visibility(1);
  assert.equal(video.calls.at(-1), 'pause');
  assert.equal(video.events.filter(event => event.name === 'playbacksummary').length, 1);
  const before = video.calls.length;
  video.detach(); video.visibility(1); video.instance.play();
  assert.equal(video.calls.length, before);
  assert.equal(video.disconnected, true);
});

test('ordinary wrapper scopes sound and removes participants through runtime relations', async () => {
  const group = mount(groupDefinition), otherGroup = mount(groupDefinition);
  const first = mount(videoDefinition), second = mount(videoDefinition), outsider = mount(videoDefinition);
  connect(group, first); connect(group, second); connect(otherGroup, outsider);
  first.instance.setMuted(false); second.instance.setMuted(false); outsider.instance.setMuted(false);
  await tick();
  assert.equal(first.instance.data.soundOff, true);
  assert.equal(second.instance.data.soundOff, false);
  assert.equal(outsider.instance.data.soundOff, false);
  assert.equal(group.instance.data.memberCount, 2);
  groupDefinition.relations.participant.unlinked.call(group.instance, second.instance);
  videoDefinition.relations['video-group'].unlinked.call(second.instance, group.instance);
  group.instance.muteAll(); await tick();
  assert.equal(second.instance.data.soundOff, false);
  assert.equal(group.instance.data.memberCount, 1);
  group.detach(); otherGroup.detach(); first.detach(); second.detach(); outsider.detach();
});

test('useVideo composes reactive props and derived state without a second player implementation', async () => {
  defineComponent(({defineProps}) => {
    const props = defineProps({paused: {type: Boolean, value: false}, muted: {type: Boolean, value: true}, src: {type: String, value: ''}});
    const video = useVideo(props, {selector: '#custom-video'});
    return {...video, label: computed(() => video.state.isPlaying ? 'playing' : 'paused')};
  });
  const definition = registered;
  const first = mount(definition), second = mount(definition);
  first.ready(); first.visibility(1); first.contextReady();
  first.instance.play(); first.instance.onPlay({detail: {}}); await tick();
  assert.equal(first.instance.data.label, 'playing');
  assert.equal(second.instance.data.label, 'paused');
  first.updateProps({paused: true}); await tick();
  assert.equal(first.calls.at(-1), 'pause');
  first.updateProps({paused: false, muted: false}); await tick();
  assert.equal(first.calls.at(-1), 'play');
  assert.equal(first.instance.data.soundOff, false);
  first.instance.onLoadedMetadata({detail: {duration: 100}});
  first.instance.onTimeUpdate({detail: {currentTime: 10}});
  first.updateProps({src: 'another-source'}); await tick();
  assert.equal(first.instance.data.currentTime, 0);
  assert.equal(first.events.find(event => event.name === 'playbacksummary').detail.reason, 'sourcechange');
  first.detach(); second.detach();
});

test('a video error clears playing state and permits an explicit retry', async () => {
  const video = mount(videoDefinition);
  video.ready(); video.visibility(1); video.contextReady();
  video.instance.play(); video.instance.onPlay({detail:{}}); await tick();
  video.instance.onError({detail:{errMsg:'decode failed'}}); await tick();
  assert.equal(video.instance.data.isPlaying,false);
  assert.equal(video.events.filter(event => event.name==='playbacksummary').length,1);
  assert.equal(video.events.find(event => event.name==='playbacksummary').detail.reason,'error');
  const before=video.calls.length;
  video.instance.play();
  assert.deepEqual(video.calls.slice(before),['play']);
  video.detach();
});

test('custom reactive group and participant share the ordinary wrapper protocol', async () => {
  defineComponent(() => useVideoGroup());
  const customGroupDefinition = registered;
  const group = mount(customGroupDefinition);
  defineComponent(() => {
    const participant = useVideoParticipant(() => {});
    return participant;
  });
  const customParticipantDefinition = registered;
  const child = mount(customParticipantDefinition);
  customGroupDefinition.relations.participant.linked.call(group.instance, child.instance);
  customParticipantDefinition.relations['video-group'].linked.call(child.instance, group.instance);
  assert.equal(customGroupDefinition.behaviors.includes(customParticipantDefinition.relations['video-group'].target), true);
  child.instance.activateSound();
  customGroupDefinition.relations.participant.unlinked.call(group.instance, child.instance);
  await tick(); assert.equal(group.instance.data.memberCount, 0);
  group.detach(); child.detach();
});

test('Reactive Page uses useVideo directly with native page APIs and no component relations', async () => {
  globalThis.Page = options => { registered = options; };
  const events = [];
  definePage(() => useVideo({src: '/test.mp4'}, {
    group: false,
    selector: '#page-player',
    emit: (name, detail) => events.push({name, detail}),
  }));
  const definition = registered;
  assert.equal(Object.keys(definition.relations || {}).length, 0);
  const page = mount(definition);
  const originalQuery = page.instance.createSelectorQuery;
  const originalObserver = page.instance.createIntersectionObserver;
  delete page.instance.createSelectorQuery;
  delete page.instance.createIntersectionObserver;
  globalThis.wx = {
    createVideoContext,
    createSelectorQuery() {
      const query = originalQuery();
      return { ...query, in(owner) { assert.equal(owner, page.instance); return this; } };
    },
    createIntersectionObserver(owner) { assert.equal(owner, page.instance); return originalObserver(); },
  };
  try {
    page.ready(); page.visibility(1); page.contextReady();
    page.instance.play(); page.instance.onPlay({detail: {}});
    page.instance.onTimeUpdate({detail: {currentTime: 2}});
    await tick(); assert.equal(page.instance.data.currentTime, 2);
    page.detach();
    assert.equal(events.at(-1).name, 'playbacksummary');
    assert.equal(events.at(-1).detail.reason, 'detach');
  } finally { delete globalThis.wx; delete globalThis.Page; }
});
