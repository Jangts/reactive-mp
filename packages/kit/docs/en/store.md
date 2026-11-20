# Independent Store forwarding

Store retains its independent @reactive-mp/store package, version and [documentation](https://reactive-mp-store-docs.pages.jangts.cafe/en/). Kit /store forwards both named and default exports; the Kit root forwards named APIs.

```js
import { defineStore } from '@reactive-mp/kit/store';
import { useSignal } from '@reactive-mp/reactivity';

const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});

const first = useCounter();
const second = useCounter();
first.increment();
console.log(second.count()); // 1
useCounter.dispose();
```

Run this example in a Node.js ESM project with the delivered packages installed. Prepared native projects import vendor/kit/miniprogram/store.js. Each definition owns a lazy shared instance and setup returns an object synchronously. Cleanup and storeToRefs follow the [Store guide](https://reactive-mp-store-docs.pages.jangts.cafe/en/guide.html).
