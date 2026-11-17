# 独立 Store 转发

Store 保留 @reactive-mp/store 独立 npm 包、版本和[文档站](https://reactive-mp-store-docs.pages.jangts.cafe/)。Kit 的 /store 子入口直接转发其命名和默认导出，根入口转发其命名 API。

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

这段代码可以在已安装包体的 Node.js ESM 工程运行。原生源码准备后，从 vendor/kit/miniprogram/store.js 导入同一入口。每个 defineStore 定义拥有自己的惰性共享实例，setup 必须同步返回对象；清理与 storeToRefs 合同沿用[Store 指南](https://reactive-mp-store-docs.pages.jangts.cafe/guide.html)。
