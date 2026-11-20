# Shared state in native pages

reactive-mp re-exports defineStore and storeToRefs. Define the Store outside page setup so all consumers use the same definition:

```js
// stores/counter.js；工程已接入 reactive-mp。
import { defineStore, useSignal } from 'reactive-mp';

export const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});
```

Call useCounter inside setup and return the signals and actions needed by WXML. Page destruction does not stop this shared Store. Call useCounter.dispose() to end its shared resources; the next call creates a new instance.

Store setup must return an object synchronously. Start requests and timers in actions or instance lifecycle hooks; use onScopeDispose for Store-owned subscriptions. Ordinary Pages can explicitly subscribe and connect changes to setData.

Projects without the Mini Program runtime can consume @reactive-mp/store independently. The core implementation is identical. See [API reference](api.md).
