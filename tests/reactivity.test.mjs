import test from 'node:test';
import assert from 'node:assert/strict';
import { reactive, ref, mutable, computed, useSignal, watch, watchEffect, createEffectScope, runInEffectFreeScope } from '@reactive-mp/reactivity';
import { defineStore, storeToRefs } from '@reactive-mp/store';
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
test('nested objects, arrays, replacement, deletion and ref reuse', async () => {
  const scope = createEffectScope();
  let state, total, calls = 0;
  scope.run(() => {
    state = reactive({ nested: { n: 1 }, list: [1] });
    total = computed(() => state.nested.n + state.list.length);
    watchEffect(() => { total(); calls++; });
  });
  assert.equal(state.nested, state.nested);
  assert.equal(total(), 2);
  state.nested.n = 2; state.list.push(3); await tick(); assert.equal(total(), 4);
  const old = state.nested;
  state.nested = { n: 10 }; await tick(); assert.equal(total(), 12);
  const before = calls; old.n = 99; await tick(); assert.equal(calls, before);
  state.nested.n = 10; // identical writes must succeed in strict mode
  delete state.nested.n; await tick(); assert.ok(Number.isNaN(total()));
  const r = ref({ count: 1 }); assert.equal(r.value, r.value);
  r.value.count = 2; assert.equal(r.value.count, 2);
  r.value = { count: 4 }; assert.equal(r.value.count, 4);
  scope.stop();
});
test('mutable carriers preserve falsy values and allow repeated schema additions', () => {
  const [state, assign] = mutable({ value: 1 });
  state.value = 0; assert.equal(state.value, 0);
  state.value = 0;
  assign({ value: false, other: '' });
  assert.equal(state.value, false); assert.equal(state.other, '');
});
test('batched watchers retain the previous delivered value; pause/resume/once', async () => {
  const [n, set] = useSignal(0); const seen = [];
  const stop = watch(n, (value, previous) => seen.push([value, previous]));
  set(1); set(2); await tick(); assert.deepEqual(seen, [[2, 0]]);
  stop.pause(); set(3); await tick(); assert.equal(seen.length, 1);
  stop.resume(); set(4); await tick(); assert.deepEqual(seen.at(-1), [4, 2]);
  stop(); set(5); await tick(); assert.equal(seen.length, 2);
  let once = 0; watch(n, () => once++, { once: true, immediate: true });
  set(6); await tick(); assert.equal(once, 1);
});
test('store collection never initializes singleton and page disposal cannot dispose store', async () => {
  let setups = 0, effects = 0;
  const useStore = defineStore('shared', () => {
    setups++; const [n, set] = useSignal(0);
    watchEffect(() => { n(); effects++; });
    return { n, increment: () => set(n() + 1) };
  });
  runInEffectFreeScope(() => useStore());
  assert.equal(setups, 1); assert.equal(effects, 0);
  const page = createEffectScope(); let store;
  page.run(() => { store = useStore(); }); page.stop();
  assert.equal(store, useStore()); store.increment(); await tick();
  assert.equal(effects, 2); assert.equal(storeToRefs(store).n(), 1);
  store.$dispose(); const previous = effects; store.increment(); await tick(); assert.equal(effects, previous);
  assert.notEqual(useStore(), store); useStore.dispose();
});
test('all cleanup runs after failure, stopped scopes cannot restart, detached scopes retain collection semantics', async () => {
  const { onScopeDispose } = await import('@reactive-mp/reactivity');
  const scope = createEffectScope(); let cleaned = 0;
  scope.run(() => { onScopeDispose(() => { throw Error('cleanup'); }); onScopeDispose(() => cleaned++); });
  assert.throws(() => scope.stop(), AggregateError); assert.equal(cleaned, 1);
  scope.stop(); assert.throws(() => scope.run(() => {}), /stopped/);
  let effects = 0;
  runInEffectFreeScope(() => createEffectScope(true).run(() => watchEffect(() => effects++)));
  assert.equal(effects, 0);
});
