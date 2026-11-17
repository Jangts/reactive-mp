# 在原生页面共享状态

reactive-mp 统一导出 defineStore 和 storeToRefs。将 Store 定义放在页面外，多个页面或组件调用同一个 useStore，取得共享的 Signal 和动作。

```js
// stores/counter.js；工程已接入 reactive-mp。
import { defineStore, useSignal } from 'reactive-mp';

export const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});
```

页面 setup 中调用 useCounter 并返回需要绑定的 Signal 与动作，模板读取 count、事件调用 increment。页面销毁不停止共享 Store；业务需要结束共享资源时调用 useCounter.dispose()，再次调用会创建新实例。

Store setup 同步返回对象。请求与定时器由动作或实例生命周期启动，Store 自有订阅使用 onScopeDispose 清理。使用普通 Page 时也可通过订阅显式连接 setData。

不需要小程序运行时的工程可以独立使用 @reactive-mp/store，核心共享逻辑与统一入口相同。完整函数和类型见[API 参考](api.md)。
