# 响应式与组合式，留在原生。

面向原生微信小程序的开发工具。保留熟悉的 JS、WXML、WXSS 和平台注册方式，让状态驱动界面，让业务逻辑自然组合。

[开始使用](getting-started.md) · [浏览 API](api.md)

## 原生开发，更好组织

| 能力 | 使用方式 |
| --- | --- |
| 响应式状态 | Signal、computed 与 watch，自动追踪读取的依赖 |
| 组合逻辑 | 在 setup 中组织状态、生命周期、通信与资源清理 |
| 原生混用 | Page/Component 配置和动态声明按需组合 |
| 共享状态 | 惰性 Store，在页面与组件间复用 |

## 一个原生计数器

依赖准备后，在 `components/counter/counter.js` 中导入统一入口：

```js
import { defineComponent, useSignal, computed } from '../../vendor/reactive-mp/src/index.js';

defineComponent(() => {
  const [count, setCount] = useSignal(0);
  const label = computed(() => `count=${count()}`);
  return { label, increment: () => setCount(count() + 1) };
});
```

原生模板 `counter.wxml`：

```xml
<button bindtap="increment">{{label}}</button>
```

组件 JSON 声明 `component: true`，页面登记组件后，点击按钮即可更新 label。完整安装、文件位置和接线见[快速上手](getting-started.md)。

## 按你的任务继续

- [响应式与组合逻辑](guide.md)：状态、监听、生命周期和组件通信。
- [原生配置与动态声明](native-options.md)：保留原生配置，按需使用 Hook。
- [共享状态](store.md)：跨页面共享与资源生命周期。
- [API 参考](api.md)：公开接口与类型签名。
- [运行原理](setup-runtime.md)：深入了解收集、实例和同步机制。

维护源码、开发宿主或文档站，请进入[维护者入口](architecture.md)。
