import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.Behavior = options => options;
let definition;
globalThis.Component = options => { definition = options; };
globalThis.Page = options => { definition = options; };
const api = await import('reactive-mp');
const { defineComponent, definePage, useSignal, computed, watch, watchEffect,
  onMounted, onUnmounted, onReady, useCurrentInstance, inject, onPageScroll } = api;
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
function instantiate(options, props = {}, pageId = 'page:1') {
  let attached = false;
  const instance = {
    data: { ...options.data }, properties: props,
    getPageId: () => pageId,
    selectOwnerComponent: () => null,
    triggerEvent() {},
    setData(data, callback) {
      assert.ok(attached, 'view writes must wait for attached');
      Object.assign(this.data, data); callback?.();
    },
  };
  Object.assign(instance, options.methods || {});
  for (const [key, value] of Object.entries(options)) {
    if (key.startsWith('on') && typeof value === 'function') instance[key] = value;
  }
  for (const behavior of options.behaviors) behavior.lifetimes?.created?.call(instance);
  attached = true;
  for (const behavior of options.behaviors) behavior.lifetimes?.attached?.call(instance);
  return instance;
}
test('one collection, isolated instance state, hooks and native setData', async () => {
  let runs = 0, mounted = 0, disposed = 0, effects = 0;
  defineComponent(() => {
    const initial = ++runs;
    const [count, set] = useSignal(initial);
    const double = computed(() => count() * 2);
    watchEffect(() => { count(); effects++; });
    onMounted(() => mounted++);
    onUnmounted(() => disposed++);
    return { count, double, increment: () => set(count() + 1) };
  });
  assert.equal(runs, 1); assert.equal(effects, 0); assert.equal(mounted, 0);
  const a = instantiate(definition), b = instantiate(definition);
  assert.equal(a.data.count, 2); assert.equal(b.data.count, 3);
  definition.lifetimes.attached.call(a);
  assert.equal(mounted, 1);
  a.increment(); await tick();
  assert.equal(a.data.count, 3); assert.equal(a.data.double, 6);
  assert.equal(b.data.count, 3);
  a.setData({ count: 8 }); await tick(); assert.equal(a.data.double, 16);
  definition.lifetimes.detached.call(a);
  const previousEffects = effects;
  a.increment(); await tick(); assert.equal(effects, previousEffects);
  assert.equal(disposed, 1);
  definition.lifetimes.detached.call(b);
});
test('collected and native options, props and lifetimes compose', async () => {
  let nativeReady = 0, hookReady = 0;
  defineComponent(({ defineOptions, defineProps, defineRelation, extClasses }) => {
    defineOptions({ multipleSlots: true });
    extClasses('dynamic');
    const props = defineProps({ step: { type: Number, value: 1 } });
    defineRelation('parent', { type: 'parent', linked() {}, unlinked() {} });
    onReady(() => hookReady++);
    return { label: computed(() => `${props.step}:${props.title}`) };
  }, {
    properties: { title: { type: String, value: 'default' } },
    options: { virtualHost: true }, externalClasses: ['native'],
    lifetimes: { ready() { nativeReady++; } },
  });
  assert.deepEqual(definition.options, { virtualHost: true, multipleSlots: true });
  assert.deepEqual(definition.externalClasses, ['native', 'dynamic']);
  assert.ok(definition.relations.parent.linked); assert.ok(definition.relations.parent.unlinked);
  const instance = instantiate(definition, { step: 5, title: 'actual' });
  assert.equal(instance.data.label, '5:actual');
  definition.observers['title,step'].call(instance, 'next', 7); await tick();
  assert.equal(instance.data.label, '7:next');
  definition.lifetimes.ready.call(instance);
  assert.equal(nativeReady, 1); assert.equal(hookReady, 1);
  definition.lifetimes.detached.call(instance);
});
test('current instance is absent during collection and available in each setup', () => {
  const seen = [];
  defineComponent(() => { seen.push(useCurrentInstance()); return {}; });
  assert.equal(seen[0], null);
  const a = instantiate(definition), b = instantiate(definition);
  assert.equal(seen[1], a); assert.equal(seen[2], b);
  definition.lifetimes.detached.call(a); definition.lifetimes.detached.call(b);
});
test('scope nesting, restoration, cleanup and watcher writes', async () => {
  const { default: createScope, getCurrentEffectScope, runInEffectFreeScope, isRunInEffectFreeScope } = await import('@reactive-mp/reactivity/EffectScope');
  const parent = createScope();
  let triggered = 0;
  const [source, set] = useSignal(0), [result, setResult] = useSignal(0);
  parent.run(() => {
    const child = createScope();
    child.run(() => watch(source, value => { triggered++; setResult(value); }));
    runInEffectFreeScope(() => { createScope().run(() => assert.equal(isRunInEffectFreeScope(), true)); });
    assert.ok(getCurrentEffectScope());
  });
  set(1); await tick(); assert.equal(result(), 1); assert.equal(triggered, 1);
  parent.stop(); set(2); await tick(); assert.equal(triggered, 1);
  assert.equal(getCurrentEffectScope(), null);
});
test('failed collection restores active contexts', async () => {
  assert.throws(() => defineComponent(() => { throw Error('collection failed'); }), /collection failed/);
  const { useActiveSetupContext } = await import('../packages/runtime/src/main.js');
  assert.equal(useActiveSetupContext(), null);
  defineComponent(() => ({ good: useSignal(3)[0] }));
  assert.equal(instantiate(definition).data.good, 3);
});
test('page lifecycle, provision and component page events need no phase branches', async () => {
  let load = 0, unload = 0, scroll = 0, disposed = 0;
  let setMessage;
  definePage(({ provide }) => {
    const [message, set] = useSignal('hello'); setMessage = set;
    provide('message', message);
    return { message };
  }, { onLoad() { load++; }, onUnload() { unload++; }, onPageScroll() { scroll++; } });
  const pageOptions = definition, page = instantiate(pageOptions);
  page.onLoad({}); assert.equal(load, 1);
  defineComponent(() => {
    const message = inject('message', 'default');
    onPageScroll(() => scroll++);
    onUnmounted(() => disposed++);
    return { message };
  });
  const childOptions = definition, child = instantiate(childOptions);
  childOptions.behaviors[0].lifetimes.attached.call(child);
  childOptions.lifetimes.attached.call(child);
  assert.equal(child.data.message, 'hello');
  setMessage('updated'); await tick(); assert.equal(child.data.message, 'updated');
  page.onPageScroll({ scrollTop: 1 }); assert.equal(scroll, 2);
  childOptions.lifetimes.detached.call(child);
  page.onPageScroll({ scrollTop: 2 }); assert.equal(scroll, 3);
  page.onUnload(); assert.equal(unload, 1); assert.equal(disposed, 1);
});
test('static-only properties and native attached/detached remain supported', () => {
  let attached = 0, detached = 0;
  defineComponent(({ defineProps }) => {
    const props = defineProps();
    return { title: computed(() => props.title) };
  }, { properties: { title: String }, lifetimes: {
    attached() { attached++; }, detached() { detached++; },
  } });
  const instance = instantiate(definition, { title: 'native' });
  assert.equal(instance.data.title, 'native');
  definition.lifetimes.attached.call(instance);
  definition.lifetimes.detached.call(instance);
  assert.equal(attached, 1); assert.equal(detached, 1);
});
test('nested registration keeps collection and hook contexts separate', () => {
  let mounted = 0;
  defineComponent(() => {
    defineComponent(() => ({}));
    onMounted(() => mounted++);
    return { count: useSignal(1)[0] };
  });
  const outer = definition, instance = instantiate(outer);
  outer.lifetimes.attached.call(instance);
  assert.equal(mounted, 1);
  outer.lifetimes.detached.call(instance);
});
test('computed updates synchronously and drops obsolete branch dependencies', async () => {
  const [branch, setBranch] = useSignal(true), [a, setA] = useSignal(1), [b, setB] = useSignal(10);
  let computations = 0;
  const value = computed(() => { computations++; return branch() ? a() : b(); });
  assert.equal(value(), 1);
  setBranch(false); assert.equal(value(), 10);
  const before = computations;
  setA(2); await tick(); assert.equal(computations, before);
  setB(20); assert.equal(value(), 20);
});
test('mixed data and signal observers preserve native handlers and stop on disposal', async () => {
  let native = 0, mixed = [], setCount;
  defineComponent(({ observe }) => {
    const [count, set] = useSignal(1); setCount = set;
    observe(['title', count], (...values) => mixed.push(values));
    return { count };
  }, { data: { title: 'first' }, observers: { title() { native++; } } });
  const instance = instantiate(definition);
  instance.data.title = 'next'; definition.observers.title.call(instance, 'next');
  assert.equal(native, 1); assert.deepEqual(mixed[0], ['next', 1]);
  setCount(2); await tick(); assert.deepEqual(mixed.at(-1), ['next', 2]);
  definition.lifetimes.detached.call(instance);
  const calls = mixed.length; setCount(3); await tick(); assert.equal(mixed.length, calls);
});
test('page return hooks and component-as-page keep native return values', () => {
  const { onShareAppMessage, defineComponentPage, onLoad, onUnload } = api;
  let loads = 0, unloads = 0;
  definePage(() => {
    onShareAppMessage(() => ({ title: 'hook' }));
    return {};
  }, { onShareAppMessage() { return { title: 'native' }; } });
  const pageOptions = definition, page = instantiate(pageOptions, {}, 'return-page');
  assert.deepEqual(page.onShareAppMessage({}), { title: 'hook' }); page.onUnload();
  defineComponentPage(({ defineProps }) => {
    const props = defineProps({ title: String });
    onLoad(() => loads++); onUnload(() => unloads++);
    onShareAppMessage(() => ({ title: props.title }));
    return { title: computed(() => props.title) };
  });
  const options = definition, instance = instantiate(options, { title: 'component page' }, 'component-page');
  instance.onLoad({}); assert.equal(loads, 1);
  assert.deepEqual(instance.onShareAppMessage(), { title: 'component page' });
  instance.onUnload(); options.lifetimes.detached.call(instance);
  assert.equal(unloads, 1);
});
test('repeated props declarations merge and relations dispatch to the actual instance', () => {
  let linked = 0, unlinked = 0;
  defineComponent(({ defineProps, defineRelation, defineExpose }) => {
    const first = defineProps({ first: Number });
    const second = defineProps({ second: String });
    defineRelation('parent', { type: 'parent', linked() { linked++; }, unlinked() { unlinked++; } });
    defineExpose({ first });
    return { label: computed(() => `${first.first}:${second.second}`) };
  });
  const options = definition, instance = instantiate(options, { first: 7, second: 'yes' }, 'relations');
  assert.equal(instance.data.label, '7:yes');
  options.relations.parent.linked.call(instance, {});
  options.relations.parent.unlinked.call(instance, {});
  assert.equal(linked, 1); assert.equal(unlinked, 1);
  assert.equal(options.export.call(instance).first.first, 7);
  options.lifetimes.detached.call(instance);
});
test('registration data is serializable and native Behavior objects survive merging', () => {
  const native = Behavior({}), dynamic = Behavior({});
  defineComponent(({ behaviors }) => { behaviors(dynamic); return { count: useSignal(1)[0] }; }, { behaviors: [native] });
  assert.deepEqual(JSON.parse(JSON.stringify(definition.data)), { count: 1 });
  assert.ok(definition.behaviors.includes(native)); assert.ok(definition.behaviors.includes(dynamic));
});
test('App signal data and formerly empty app helpers form a working API', async () => {
  let appOptions;
  globalThis.App = options => { appOptions = options; };
  const { defineApp, subscribeGlobalData, pickGlobalData, dispatchAppAction, onLaunch, onShow, onThemeChange } = api;
  const events = [];
  let set;
  defineApp(() => {
    const [count, update] = useSignal(1); set = update;
    onLaunch(function (event) { events.push(['launch', event.path, this === appOptions]); });
    onShow(() => events.push(['show']));
    onThemeChange(event => events.push(['theme', event.theme]));
    return { count, readonly: computed(() => count() * 2), add: () => update(count() + 1) };
  }, { globalData: { native: 'kept' }, customFlag: 'root', onLaunch() { events.push(['native']); } });
  appOptions.onLaunch({ path: 'home' }); appOptions.onShow({}); appOptions.onThemeChange({theme:'dark'});
  assert.deepEqual(events, [['native'], ['launch','home',true], ['show'], ['theme','dark']]);
  assert.equal(appOptions.customFlag, 'root'); assert.equal(appOptions.globalData.native, 'kept');
  assert.throws(() => { appOptions.globalData.readonly = 9; }, /readonly/);
  assert.equal(appOptions.globalData.count, 1);
  appOptions.globalData.count = 2; assert.equal(appOptions.globalData.count, 2);
  const seen = []; const stop = subscribeGlobalData('count', value => seen.push(value));
  set(3); assert.equal(pickGlobalData('count').count, 3);
  dispatchAppAction('add'); assert.equal(appOptions.globalData.count, 4);
  stop(); set(5); assert.deepEqual(seen, [3, 4]);
});
test('throwing unmount cleanup still releases watchers and the remaining cleanup handlers', async () => {
  let disposed = 0, effects = 0, setCount;
  defineComponent(() => {
    const [count, set] = useSignal(0); setCount = set;
    watchEffect(() => { count(); effects++; });
    onUnmounted(() => { throw Error('expected cleanup failure'); });
    onUnmounted(() => disposed++);
    return { count };
  });
  const options = definition, instance = instantiate(options);
  assert.throws(() => options.lifetimes.detached.call(instance), AggregateError);
  setCount(1); await tick(); assert.equal(effects, 1); assert.equal(disposed, 1);
});

test('native defaults, relation target callbacks, beforeDetach and nested collection preserve their contracts', () => {
  let linked = 0, late = 0;
  defineComponent(({ defineProps, defineRelation }) => {
    const props = defineProps({ any: null, text: String, list: Array, made: { type: Object, default: () => ({ n: 1 }) } });
    defineRelation('parent', { type: 'parent', target: 'native-behavior', linked() { linked++; } });
    api.onBeforeDetach(() => late++);
    return { text: props.text, any: props.any, made: props.made };
  });
  const options = definition;
  assert.equal(options.data.text, ''); assert.equal(options.data.any, null); assert.deepEqual(options.data.made, {n:1});
  const instance = instantiate(options);
  options.relations.parent.linked.call(instance, {}); assert.equal(linked,1);
  options.lifetimes.beforeDetach.call(instance); assert.equal(late,1);
  assert.throws(() => instance.setData({text:'late'}), /disposed/);
  options.lifetimes.detached.call(instance);
  let mounted = 0;
  defineComponent(() => {
    if (useCurrentInstance()) defineComponent(() => { onMounted(() => mounted++); return {}; });
    return {};
  });
  const outer=definition;const owner=instantiate(outer); outer.lifetimes.attached.call(owner);
  assert.equal(mounted,0); outer.lifetimes.detached.call(owner);
});
test('asynchronous setup is rejected and required hooks fail outside setup', () => {
  assert.throws(() => defineComponent(() => Promise.resolve({})), /synchronously/);
  assert.throws(() => api.inject('missing'), /inside setup/);
});
