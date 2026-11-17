# 快速上手

可独立在 JavaScript 环境使用，不要求微信宿主。下面使用 Node.js 22+ 运行示例。

## 安装本地交付包

取得匹配版本的两个 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz
```

这里使用本地包体，不假定公共 registry 已发布相应版本。

## 创建状态与监听

保存为 demo.mjs，运行 `node demo.mjs`：

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

count() 读取当前值，setCount 更新状态。派生值同步可读，监听在微任务交付；停止 scope 解除其中建立的监听。继续阅读[状态、监听与作用域](guide.md)。
