# @reactive-mp/shared

不依赖 wx 的事件总线、微任务调度、数组合并和基础值识别。适合独立 JavaScript 程序或小程序运行时底层。

## 安装包体

取得交付的以下 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz
```

包体可以由源码仓库根目录执行以下命令产生；安装时使用同一次交付的依赖版本：

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

## 首次使用

将下面代码保存为 demo.mjs，在安装包体的工程中运行 `node demo.mjs`：

```js
import { EventBus, debounceMicrotask } from '@reactive-mp/shared';

const events = new EventBus();
const stop = events.on('count', ({ payload }) => console.log(payload));
const publish = debounceMicrotask((value) => events.emit('count', value));
publish(1);
publish(2); // 本微任务结束后输出一次 2
await Promise.resolve();
stop();
```

## 继续使用与边界

EventBus.once 在回调执行前解绑，重入或抛错不会再次交付；on 的返回函数解除订阅。debounceMicrotask 合并同一微任务内的参数，不承担底层异步任务取消。

[完整签名](index.d.ts) · [源码入口](src/index.js)。类型入口随包体交付。工作区开发与平台验证资料由源码仓库的维护入口管理。
