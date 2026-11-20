# Quick start

Reactivity works independently in JavaScript and does not require a WeChat host. The following example uses Node.js 22+.

## Install delivered archives

Use matching local archives in the consumer project:

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz
```

This delivery method does not assume a public registry release.

## State and watchers

Save as demo.mjs and run node demo.mjs:

```js
import { useSignal, computed, watch, createEffectScope } from '@reactive-mp/reactivity';

const scope = createEffectScope();
const [count, setCount] = useSignal(1);
const doubled = computed(() => count() * 2);
scope.run(() => watch(count, (value, previous) => console.log(previous, value)));

setCount(2);
console.log(doubled()); // 4
await Promise.resolve(); // watch 输出 1 2
scope.stop();
```

count() reads the value. setCount updates it. Derived values are immediately readable, while the watcher delivers in a microtask. Stopping the scope releases its watchers. Continue with [State, watchers and scopes](guide.md).
