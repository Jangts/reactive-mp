# Quick start

## Install delivered archives

Use three matching archives in a consumer project with Node.js 22+:

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz
```

These examples do not assume a public registry release.

## Define and consume

Save as demo.mjs and run node demo.mjs:

```js
import { defineStore, storeToRefs } from '@reactive-mp/store';
import { useSignal } from '@reactive-mp/reactivity';

const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});
const first = useCounter();
const second = useCounter();
first.increment();
console.log(second.count()); // 1
const { count } = storeToRefs(first);
console.log(count()); // 1
useCounter.dispose();
console.log(useCounter().count()); // 0，新实例
useCounter.dispose();
```

Place the definition in a module and reuse the same useCounter. Do not call defineStore anew in every page. Continue with [Shared scope and resource lifetime](guide.md).
