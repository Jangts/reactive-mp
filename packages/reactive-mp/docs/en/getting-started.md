# Quick start

Use a native WeChat Mini Program. Source preparation requires Node.js 22+. An independent project consumes delivered tarballs and then prepares the dependency graph for native tools.

## Integrate with a native project

Create matching tarballs from the source workspace:

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

Copy the five core archives into the consumer project and run the following commands there. Versions must match the actual delivery:

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-1.0.0.tgz
node node_modules/reactive-mp/tools/prepare-native.mjs --out ./miniprogram/vendor
```

This example assumes miniprogram is the native project root. The tool copies ESM sources and resolves package imports; it does not transform setup, WXML or WXSS. vendor is owned by the tool. Keep application files outside it and rerun preparation after updating packages.

Create miniprogram/components/counter/counter.js:

```js
import { defineComponent, useSignal, computed } from '../../vendor/reactive-mp/src/index.js';

defineComponent(() => {
  const [count, setCount] = useSignal(0);
  const label = computed(() => `count=${count()}`);
  return { label, increment: () => setCount(count() + 1) };
});
```

counter.json:

```json
{ "component": true }
```

counter.wxml:

```xml
<button bindtap="increment">{{label}}</button>
```

counter.wxss may be empty. Register "counter": "/components/counter/counter" in a page's usingComponents and render the counter tag. Open miniprogram in WeChat DevTools: the initial label is count=0 and increments on each tap.

Continue with [composition](guide.md), [native options](native-options.md) or [shared state](store.md).

## Source workspace

Use Node.js 22+, npm and WeChat DevTools:

```sh
npm ci
npm run check
npm run dev
```

Open examples/integration. Hosts use touristappid by default; use your own local AppID configuration for login, sharing and other restricted capabilities. Do not commit personal configuration.

npm run dev watches packages and refreshes each host's vendor directory. It resolves imports without translating setup or templates. The native tools read the current workspace implementation.

A runnable host page:

<<< examples/integration/pages/index/index.js

Its native template:

<<< examples/integration/pages/index/index.wxml

Start requests and timers in lifecycle hooks. Keep pure computation in setup; ordinary application code does not need to branch on collection and instance phases.
