import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { normalizeIndex, resolveLayout, itemEntries } from '../packages/swiper/miniprogram/utils/layouts.js';

test('swiper layouts, stable keys and indices handle empty, shrinking and circular lists', () => {
  assert.equal(normalizeIndex(5, 0), 0);
  assert.equal(normalizeIndex(-1, 3, true), 2);
  assert.equal(normalizeIndex(7, 3), 2);
  assert.equal(normalizeIndex(NaN, 3), 0);
  assert.equal(resolveLayout('unknown'), resolveLayout('plain'));
  const entries = itemEntries([{id: 'a'}, {id: 'a'}, {}, {id: 'b'}], 'id');
  assert.equal(new Set(entries.map(item => item.key)).size, 4);
  assert.equal(itemEntries([{id:'b'}, {id:'a'}], 'id')[1].key, entries[0].key);
});

globalThis.Behavior = value => value;
let definition;
globalThis.Component = value => { definition = value; };
globalThis.Page = value => { definition = value; };
await import('../packages/swiper/miniprogram/components/swiper/index.js');
const component = definition;
const { useSwiper, useMediaSwiper } = await import('@reactive-mp/swiper');
const { definePage, defineComponent } = await import('@reactive-mp/runtime');
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
function mount(options, values = {}, aliasProperties = false) {
  const props = Object.fromEntries(Object.entries(options.properties || {}).map(([key, schema]) => [key, schema.value]));
  const events = [];
  const instance = {
    data: {...props, ...options.data}, properties: {...props, ...values},
    getPageId: () => 'swiper-test', selectOwnerComponent: () => null,
    setData(update, callback) {
      Object.assign(this.data, update);
      if (aliasProperties) {
        for (const behavior of options.behaviors || []) { behavior.observers?.['**']?.call(this); }
      }
      callback?.();
    },
    triggerEvent(name, detail) {
      events.push({name, detail});
      if (aliasProperties && name === 'change') {
        this.data.current = detail.current;
        for (const behavior of options.behaviors || []) { behavior.observers?.['**']?.call(this); }
      }
    },
  };
  if (aliasProperties) { Object.assign(instance.data, instance.properties); instance.properties = instance.data; }
  Object.assign(instance, options.methods || Object.fromEntries(Object.entries(options).filter(([, value]) => typeof value === 'function')));
  for (const behavior of options.behaviors || []) { behavior.lifetimes?.created?.call(instance); }
  for (const behavior of options.behaviors || []) { behavior.lifetimes?.attached?.call(instance); }
  options.lifetimes?.attached?.call(instance); options.onLoad?.call(instance);
  return {
    instance, events,
    update(values) {
      Object.assign(instance.properties, values);
      for (const behavior of options.behaviors || []) { behavior.observers?.['**']?.call(instance); }
    },
    ready() { options.lifetimes?.ready?.call(instance); options.onReady?.call(instance); },
    detach() { options.lifetimes?.detached?.call(instance); options.onUnload?.call(instance); },
  };
}
test('reactive swiper initializes nonzero current, normalizes data updates and isolates instances', async () => {
  const first = mount(component, {items: [{id:1}, {id:2}, {id:3}], current:2});
  const second = mount(component, {items: [{id:1}, {id:2}, {id:3}], circular:true});
  assert.equal(first.instance.data.swiperCurrent, 2);
  assert.equal(first.instance.data.applied, 2);
  second.instance.previous(); await tick();
  assert.equal(second.instance.data.swiperCurrent, 2);
  assert.equal(first.events.length, 0);
  first.update({items: [{id:1}]}); await tick();
  assert.equal(first.instance.data.swiperCurrent, 0);
  assert.equal(first.instance.data.applied, 0);
  first.update({items: []}); await tick();
  first.instance.next(); await tick(); assert.equal(first.instance.data.swiperCurrent, 0);
  first.detach(); second.detach();
});

test('swiper retains its requested initial index while its first items load asynchronously', async () => {
  const view=mount(component,{items:[],current:2});
  assert.equal(view.instance.data.swiperCurrent,0);
  view.update({items:[{id:'a'},{id:'b'},{id:'c'}]});await tick();
  assert.equal(view.instance.data.swiperCurrent,2);
  assert.equal(view.instance.data.applied,2);
  view.update({items:[]});await tick();
  view.update({items:[{id:'a'},{id:'b'},{id:'c'}]});await tick();
  assert.equal(view.instance.data.swiperCurrent,0);
  view.detach();
});
test('index change and animation completion are distinct and item events are content-neutral', async () => {
  const view = mount(component, {items: [{id:'a'}, {id:'b'}]});
  view.instance.next(); await tick();
  assert.equal(view.instance.data.swiperCurrent, 1);
  assert.equal(view.instance.data.applied, 0);
  view.instance.onChange({detail:{current:1, source:''}});
  assert.equal(view.events.filter(item => item.name === 'change').length, 1);
  view.instance.onTransitionStart({detail:{dx:1}});
  view.instance.onItemClick({detail:{index:0}});
  assert.equal(view.events.filter(item => item.name === 'itemclick').length, 0);
  view.instance.onAnimationFinish({detail:{current:1}}); await tick();
  assert.equal(view.instance.data.applied, 1);
  view.instance.onItemClick({detail:{index:1}});
  assert.deepEqual(view.events.at(-1).detail, {index:1, item:{id:'b'}, active:true});
  view.instance.onItemEvent({detail:{kind:'custom'}, currentTarget:{dataset:{index:1}}});
  assert.equal(view.events.at(-1).detail.detail.kind, 'custom');
  const before = view.events.length;
  view.detach(); view.instance.to(0); assert.equal(view.events.length, before);
});
test('useSwiper works directly inside Reactive Page without native component dependencies', async () => {
  const events = [];
  definePage(() => useSwiper({items:[1,2], circular:true}, {emit:(name, detail) => events.push({name, detail})}));
  const page = mount(definition);
  page.instance.previous(); await tick(); assert.equal(page.instance.data.current, 1);
  assert.equal(events.at(-1).detail.source, 'method');
  page.detach();
});
test('WXS interpolates transforms, circular seams and gates clicks without per-frame JS callbacks', async () => {
  const source = await readFile('packages/swiper/miniprogram/components/swiper/motion.wxs', 'utf8');
  const scope = {module:{exports:{}}, Math};
  vm.runInNewContext(source, scope);
  const motion = scope.module.exports;
  const stored = {}, calls = [];
  const frames = Array.from({length:3}, () => ({style:{}, getBoundingClientRect:() => ({width:100}), setStyle(style) {this.style = style;} }));
  const owner = {getState:() => stored, selectAllComponents:() => frames, callMethod:(name, payload) => calls.push({name,payload})};
  motion.configure({current:2, scale:0.8, rotate:20, circular:true}, null, owner);
  assert.equal(frames[2].style['--swiper-scale'], 1);
  assert.ok(Math.abs(frames[0].style['--swiper-scale'] - 0.8) < 0.001);
  motion.transition({detail:{dx:50}}, owner);
  assert.ok(Math.abs(frames[2].style['--swiper-scale'] - 0.9) < 0.001);
  motion.transition({detail:{dx:60}}, owner);
  assert.equal(calls.filter(call => call.name === 'onTransitionStart').length, 1);
  motion.tap({currentTarget:{dataset:{index:2}}}, owner);
  assert.equal(calls.length, 1);
  motion.finish({detail:{current:0}}, owner);
  assert.equal(frames[0].style['--swiper-scale'], 1);
  motion.tap({currentTarget:{dataset:{index:0}}}, owner);
  assert.equal(calls.at(-1).name, 'onItemClick');
});
test('prepared media item resolves its video component dependency within the native vendor graph', async () => {
  const path = await import('node:path');
  const configPath = 'examples/integration/vendor/swiper/miniprogram/components/media-item/index.json';
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const target = path.resolve(path.dirname(configPath), config.usingComponents['rmp-video']);
  assert.equal(JSON.parse(await readFile(target + '.json', 'utf8')).component, true);
});

test('native properties/data alias does not feed generated swiper state back into inputs', async () => {
  const view = mount(component, {items:[{id:'a'},{id:'b'}], circular:true}, true);
  await tick();
  view.instance.next(); await tick();
  assert.equal(view.instance.data.swiperCurrent, 1);
  view.instance.onAnimationFinish({detail:{current:1}}); await tick();
  const revision = view.instance.data.renderOptions.revision;
  view.instance.setData({unrelated:'view-only'}); await tick();
  assert.equal(view.instance.data.renderOptions.revision, revision);
  assert.equal(view.instance.data.applied, 1);
  view.instance.properties.items[1].id = 'changed-in-place';
  for (const behavior of component.behaviors) { behavior.observers?.['**']?.call(view.instance); }
  await tick();
  assert.equal(view.instance.data.entries[1].value.id, 'changed-in-place');
  view.detach();
});

test('media swiper participates as a group member and coordinates sounds without exposing derived data', async () => {
  const {useVideoGroup} = await import('@reactive-mp/video');
  defineComponent(() => useVideoGroup()); const groupOptions = definition;
  const group = mount(groupOptions);
  defineComponent(({defineProps}) => useMediaSwiper(defineProps({items:{type:Array,value:[]}})));
  const mediaOptions = definition;
  const data = [{id:'a',type:'image',src:'/a.png'},{id:'b',type:'video',src:'/b.mp4'}];
  const first = mount(mediaOptions,{items:data}), second = mount(mediaOptions,{items:data});
  for (const member of [first,second]) {
    groupOptions.relations.participant.linked.call(group.instance,member.instance);
    mediaOptions.relations['video-group'].linked.call(member.instance,group.instance);
  }
  const soundOn = {detail:{index:1, detail:{type:'soundon',detail:{}}}};
  first.ready(); second.ready();
  first.instance.onMediaEvent(soundOn); await tick();
  assert.equal(first.instance.data.mediaItems[1].muted,false);
  second.instance.onMediaEvent(soundOn); await tick();
  assert.equal(first.instance.data.mediaItems[1].muted,true);
  assert.equal(second.instance.data.mediaItems[1].muted,false);
  assert.equal(Object.hasOwn(second.events.at(-1).detail.item,'muted'),false);
  group.instance.muteAll(); await tick();
  assert.equal(second.instance.data.mediaItems[1].muted,true);
  let forwarded=0;
  first.instance.selectComponent=()=>({next(){forwarded++;}});
  first.instance.next(); assert.equal(forwarded,1);
  first.detach();first.instance.next();assert.equal(forwarded,1);
  second.detach();group.detach();
});

test('media swiper coordinates configured sound requests, respects later muted changes and suppresses late events', async () => {
  const {useVideoGroup} = await import('@reactive-mp/video');
  defineComponent(() => useVideoGroup()); const groupOptions = definition;
  const group = mount(groupOptions);
  defineComponent(({defineProps}) => useMediaSwiper(defineProps({items:{type:Array,value:[]}})));
  const mediaOptions = definition;
  const items = [{id:'a',type:'video',src:'/a.mp4',muted:false},{id:'b',type:'video',src:'/b.mp4',muted:false}];
  const first = mount(mediaOptions,{items}), second = mount(mediaOptions,{items});
  for (const member of [first,second]) {
    groupOptions.relations.participant.linked.call(group.instance,member.instance);
    mediaOptions.relations['video-group'].linked.call(member.instance,group.instance);
  }
  first.ready(); second.ready(); await tick();
  const unmuted = () => [first,second].flatMap(member => member.instance.data.mediaItems).filter(item => !item.muted);
  assert.equal(unmuted().length,1);
  assert.equal(first.instance.data.mediaItems[0].muted,true);
  first.update({items:items.map(item => ({...item,muted:true}))}); await tick();
  first.update({items:[{...items[0],muted:false},{...items[1],muted:true}]}); await tick();
  assert.deepEqual(first.instance.data.mediaItems.map(item => item.muted),[false,true]);
  assert.equal(unmuted().length,1);
  first.instance.onMediaEvent({detail:{index:0,detail:{type:'mutedchange',detail:{muted:true}}}}); await tick();
  assert.deepEqual(first.instance.data.mediaItems.map(item => item.muted),[true,true]);
  first.update({items:[{...items[0],src:'/updated.mp4'},{...items[1],muted:true}]}); await tick();
  assert.deepEqual(first.instance.data.mediaItems.map(item => item.muted),[true,true]);
  let notifications=0;
  defineComponent(() => useMediaSwiper({items}, {emit:() => notifications++}));
  const detached = mount(definition); detached.detach();
  detached.instance.onChange({detail:{current:1}});
  detached.instance.onMediaEvent({detail:{index:1,detail:{type:'soundon'}}});
  assert.equal(notifications,0);
  first.detach();second.detach();group.detach();
});
