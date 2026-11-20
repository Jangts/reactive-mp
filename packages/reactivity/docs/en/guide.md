# State, watchers and scopes

## Choose a state shape

useSignal(value) returns a reader and setter; Signal.value is read-only. computed(getter) tracks synchronous reads and produces a read-only result. Do not write state inside a computed getter.

reactive(object) tracks nested objects and arrays and reuses a proxy for the same raw object. ref(value) reads/writes through value. mutable and signalized offer carriers with batch assignment. See [API reference](api.md) for writable and read-only types.

## Watch and scheduling

watch accepts signals, getters, reactive objects or multiple sources. Callbacks receive the current and previous delivered values. Changes within one microtask are coalesced. immediate initially receives undefined as its previous value. once delivers once. The callable handle stops the watcher and also provides stop, pause and resume.

watchEffect runs immediately, tracks synchronous reads and drops obsolete branch dependencies. Reads after await are not part of the preceding dependency collection. A convergent watcher may write back to its source; persistent self-triggering is stopped by loop protection. Computed remains for derivation rather than write-back effects. Errors propagate to callers; a failing initial effect releases subscriptions already collected.

## Scope and cleanup

createEffectScope groups subscriptions. Run work through scope.run and stop it with scope.stop. onScopeDispose registers resource cleanup inside the active scope. Nested scopes follow their parent unless explicitly detached with true; callers own detached scope lifetime. Unregistering cleanup does not run it.

Use an instance scope in pages or components, and a detached scope only when a resource must outlive them. A stopped scope releases its effects; late asynchronous results must still be checked by application code before being applied.

## Scope example

```js
import { createEffectScope, onScopeDispose, useSignal, watch } from '@reactive-mp/reactivity';

const [enabled, setEnabled] = useSignal(false);
const scope = createEffectScope();
scope.run(() => {
  watch(enabled, value => console.log(value));
  onScopeDispose(() => console.log('released'));
});
setEnabled(true);
await Promise.resolve();
scope.stop();
```
