import test from 'node:test';
import assert from 'node:assert/strict';
import { EventBus, mergeArrayOrderByExists } from '@reactive-mp/shared';
import { useSignal, computed, createEffectScope, onScopeDispose, runInEffectFreeScope } from '@reactive-mp/reactivity';
import { defineStore } from '@reactive-mp/store';
import { createDataBinder } from '../packages/runtime/src/etc/data-binding.js';

test('once unregisters before reentrant or throwing callbacks; namespaces do not require wildcard matching', () => {
  const bus = new EventBus(false, false); let calls = 0;
  bus.once('event', () => { calls++; bus.emit('event'); throw Error('expected'); });
  assert.throws(() => bus.emit('event'), /expected/); bus.emit('event'); assert.equal(calls, 1);
  bus.on('owner/event', () => calls++); bus.offNamespace('owner'); bus.emit('owner/event'); assert.equal(calls, 1);
  assert.deepEqual(mergeArrayOrderByExists([1], undefined), [1]);
  assert.deepEqual(mergeArrayOrderByExists([1], [2,2]), [1,2]);
});
test('Store can rebuild even when its disposer fails', () => {
  const use = defineStore('failure', () => {
    onScopeDispose(() => { throw Error('cleanup'); }); return { count: useSignal(0)[0] };
  });
  const first = use(); assert.throws(() => use.dispose(), AggregateError);
  assert.notEqual(use(), first); assert.throws(() => use.dispose(), AggregateError);
});
test('collection introspection cannot permanently stop the shared collection scope', async () => {
  const { getCurrentEffectScope } = await import('@reactive-mp/reactivity');
  runInEffectFreeScope(() => getCurrentEffectScope().stop());
  assert.equal(runInEffectFreeScope(() => 7), 7);
});
test('setData updates signals before the asynchronous rendering callback and rejects writes after disposal', () => {
  const callbacks = []; const [n, set] = useSignal({ nested: 1 });
  const derived = computed(() => n().nested * 2);
  const instance = { data: {}, setData(data, callback) { Object.assign(this.data, data); if(callback) callbacks.push(callback); } };
  const binding = createDataBinder(instance); binding.bind('n', n); binding.activate({ n: n() });
  assert.notEqual(instance.data.n, n());
  instance.setData = binding.setData;
  let callbackValue;
  instance.setData({ n: { nested: 3 } }, () => { callbackValue = derived(); });
  assert.equal(derived(), 6); assert.equal(callbackValue, undefined);
  callbacks.shift()(); assert.equal(callbackValue, 6);
  binding.dispose(); const before = instance.data.n; set({nested: 8}); assert.equal(instance.data.n, before);
  assert.throws(() => instance.setData({n: {nested: 9}}), /disposed/);
});
test('pure data is available to logic without being sent to the view', () => {
  const sent = []; const instance = { data: {}, setData(data) { sent.push(data); Object.assign(this.data,data); } };
  const binding = createDataBinder(instance, /^_/g);
  const fn = () => 1;
  binding.activate({ _task: fn, label: 'ok' });
  assert.equal(instance.data._task,fn); assert.deepEqual(sent,[{label:'ok'}]); binding.dispose();
});
test('stopped getter watches release their computed subscriptions and throwing effects detach', async () => {
  const {watch, watchEffect}=await import('@reactive-mp/reactivity');
  const scope=createEffectScope();const [n,set]=useSignal(0);let computations=0;
  let stop;scope.run(()=>{stop=watch(()=>{computations++;return n();},()=>{});});
  stop();const before=computations;set(1);await Promise.resolve();assert.equal(computations,before);
  assert.throws(()=>scope.run(()=>watchEffect(()=>{n();throw Error('effect failed');})),/effect failed/);
  set(2);await Promise.resolve();scope.stop();
});
test('nested cyclic reactive objects do not recursively forward their own notifications', async () => {
  const {reactive}=await import('@reactive-mp/reactivity');
  const raw={n:0};raw.self=raw;const state=reactive(raw);assert.equal(state.self,state);
  state.self.n=1;assert.equal(state.n,1);
  assert.throws(()=>{useSignal(1)[0].value=2;},/readonly/);
});
test('convergent watcher writes are allowed while nonconvergent jobs terminate', async () => {
  const {watch}=await import('@reactive-mp/reactivity');
  const [n,set]=useSignal(0);const stop=watch(n,value=>{if(value>10)set(10);});
  set(30);await Promise.resolve();assert.equal(n(),10);stop();
  const {queueJob,flushJobs}=await import('../packages/reactivity/src/job-queue.js');
  const repeat=()=>queueJob(repeat);queueJob(repeat);
  assert.throws(()=>flushJobs(),/did not converge/);
});
test('store actions keep class private-state receivers and stable identity', () => {
  class Counter { #n=0; increment(){this.#n++;return this.#n;} }
  const use=defineStore('class',()=>new Counter());
  assert.equal(use().increment,use().increment);assert.equal(use().increment(),1);use.dispose();
});
test('native feedback replaces readonly shallow carriers without granting business writes', async () => {
  const {useSignalCarrier}=await import('@reactive-mp/reactivity');
  const [state]=useSignalCarrier({a:1, removed:2});
  const instance={data:{},setData(data,callback){Object.assign(this.data,data);callback?.();}};
  const binding=createDataBinder(instance);binding.bind('state',state);binding.activate({state});
  binding.setData({state:{a:3}});assert.equal(state.a,3);assert.equal('removed' in state,false);
  assert.throws(()=>{state.a=4;},TypeError);binding.dispose();
});

test('raw fields keep the native setData callback path inside a reactive instance', () => {
  const calls = [];
  const instance = { data: { raw: 0, count: 0 }, setData(data, callback) { calls.push(callback); Object.assign(this.data, data); callback?.call(this); } };
  const binder = createDataBinder(instance);
  const [count] = useSignal(0);
  binder.bind('count', count);
  binder.activate({ count: 0 });
  let receiver;
  const callback = function () { receiver = this; };
  binder.setData({ raw: 2 }, callback);
  assert.equal(calls.at(-1), callback);
  assert.equal(receiver, instance);
  assert.equal(count(), 0);
  binder.setData({ count: 3, raw: 4 });
  assert.equal(count(), 3);
  binder.dispose();
  assert.throws(() => binder.setData({ raw: 5 }), /disposed/);
});
