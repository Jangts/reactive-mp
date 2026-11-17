# 快速上手

## 安装本地交付包

在消费工程安装匹配版本的三个 tarball，以下示例使用 Node.js 22+：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz
```

不假定公共 registry 已发布这些包体。

## 定义与消费

保存为 demo.mjs，运行 `node demo.mjs`：

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

将定义放在模块中并复用同一个 useCounter，而不是在每个页面重新 defineStore。继续阅读[共享范围与资源寿命](guide.md)。
