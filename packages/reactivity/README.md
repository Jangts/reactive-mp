# @reactive-mp/reactivity

独立的 Signal、computed、watch、reactive/ref 和 effect scope。不依赖 wx，可在 Node 22+ 验证，也可通过依赖准备工具交付到原生小程序。

## 安装包体

取得交付的以下 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz
```

包体可以由源码仓库根目录执行以下命令产生；安装时使用同一次交付的依赖版本：

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

## 首次使用

将下面代码保存为 demo.mjs，在安装包体的工程中运行 `node demo.mjs`：

```js
import { useSignal, computed, watch, createEffectScope } from '@reactive-mp/reactivity';

const scope = createEffectScope();
const [count, setCount] = useSignal(1);
const double = computed(() => count() * 2);
scope.run(() => watch(double, (value) => console.log(value)));
setCount(2);
console.log(double()); // 同步读取 4；watch 在微任务中输出 4
await Promise.resolve();
scope.stop(); // 解除 scope 中建立的监听
```

## 继续使用与边界

watch 返回可调用 stop 句柄，并提供 pause/resume。reactive 支持嵌套对象与数组；ref 使用 value 属性。Signal.value 与 computed 只读，写入使用 useSignal 返回的更新函数。订阅应放入作用域，或由调用方停止。

[完整签名](./index.d.ts) · [源码入口](./src/index.js)。类型入口随包体交付。工作区开发与平台验证资料由源码仓库的维护入口管理。
