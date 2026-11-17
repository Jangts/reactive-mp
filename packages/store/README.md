# @reactive-mp/store

基于响应式作用域的惰性共享 Store。每个 defineStore 定义拥有自己的共享实例，作用域不跟随单个页面销毁。

## 安装包体

取得交付的以下 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz
```

包体可以由源码仓库根目录执行以下命令产生；安装时使用同一次交付的依赖版本：

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

## 首次使用

将下面代码保存为 demo.mjs，在安装包体的工程中运行 `node demo.mjs`：

```js
import { defineStore } from '@reactive-mp/store';
import { useSignal } from '@reactive-mp/reactivity';

const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});
const first = useCounter();
const second = useCounter();
first.increment();
console.log(second.count()); // 1，两个调用共享同一实例
useCounter.dispose();
```

## 继续使用与边界

storeToRefs 选取响应式字段，不复制动作。Store setup 必须同步返回对象；实例副作用不能直接放在 setup 中，库管理的副作用用作用域清理。dispose 即使有清理错误也释放当前单例，再次调用 useStore 重新创建。

[完整签名](index.d.ts) · [源码入口](src/index.js)。类型入口随包体交付。工作区开发与平台验证资料由源码仓库的维护入口管理。

## 文档

[概览](./docs/index.md) · [快速上手](./docs/getting-started.md) · [使用指南](./docs/guide.md) · [API 参考](./docs/api.md)
