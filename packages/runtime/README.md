# @reactive-mp/runtime

把配置收集、实例状态和组合 Hook 接到原生 App/Page/Component。需要微信原生宿主及响应式包；不替代 WXML、WXSS 或 JSON 配置。

## 安装包体

取得交付的以下 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-1.0.0.tgz
```

包体可以由源码仓库根目录执行以下命令产生；安装时使用同一次交付的依赖版本：

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

## 原生工程接线

在消费工程根目录执行（假设原生工程根为 miniprogram）：

```sh
node node_modules/reactive-mp/tools/prepare-native.mjs --out ./miniprogram/vendor
```

该命令读取已安装包的公开导出，只复制源码和改写导入路径，不转换 setup、WXML 或 WXSS。目标是工具拥有的生成目录，不要在其中保存业务代码；重复执行会更新这些生成文件。无需让原生工具识别裸包导入或 npm exports。

创建 miniprogram/components/counter/counter.js：

```js
import { defineComponent } from '../../vendor/runtime/src/index.js';
import { useSignal, computed } from '../../vendor/reactivity/src/index.js';

defineComponent(() => {
  const [count, setCount] = useSignal(0);
  const label = computed(() => `count=${count()}`);
  return { label, increment: () => setCount(count() + 1) };
});
```

counter.json：

```json
{ "component": true }
```

counter.wxml：

```xml
<button bindtap="increment">{{label}}</button>
```

counter.wxss 可以为空。在页面 JSON 的 usingComponents 中登记 `"counter": "/components/counter/counter"`，在页面 WXML 中写 `<counter />`。用微信开发者工具打开 miniprogram：初值 count=0，点击后每次增加 1。

## 继续使用与边界

注册时 setup 收集声明，实例创建时再建立状态。请求、定时器和原生实例操作放入生命周期；收集阶段没有真实实例。静态原生配置可作为 defineComponent 的第二参数，或放在包含 setup 的配置对象中。onMounted/onUnmounted 管理实例工作，App 使用对应应用 Hook。

[完整签名](./index.d.ts) · [源码入口](./src/index.js)。类型入口随包体交付。工作区开发与平台验证资料由源码仓库的维护入口管理。
