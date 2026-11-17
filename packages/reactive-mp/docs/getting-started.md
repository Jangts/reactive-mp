# 快速上手

需要微信原生小程序宿主；源码准备工具运行于 Node.js 22+。独立工程先安装本地交付包体，再接入页面与组件。

## 接入已有原生工程

在源码仓库根目录生成同一次交付的包体：

```sh
mkdir -p artifacts/packages
npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts
```

将生成的五个 tgz 复制到消费工程，在消费工程根目录执行（版本以实际交付为准）：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-1.0.0.tgz
node node_modules/reactive-mp/tools/prepare-native.mjs --out ./miniprogram/vendor
```

假定原生工程根目录为 `miniprogram`。准备工具只复制源码、改写包路径，不转换 setup、WXML 或 WXSS。`vendor` 是生成目录，业务文件放在其外；重新交付后再次运行准备命令。

创建 `miniprogram/components/counter/counter.js`：

```js
import { defineComponent, useSignal, computed } from '../../vendor/reactive-mp/src/index.js';

defineComponent(() => {
  const [count, setCount] = useSignal(0);
  const label = computed(() => `count=${count()}`);
  return { label, increment: () => setCount(count() + 1) };
});
```

`counter.json`：

```json
{ "component": true }
```

`counter.wxml`：

```xml
<button bindtap="increment">{{label}}</button>
```

`counter.wxss` 可以为空。已有页面的 JSON 在 `usingComponents` 中登记 `"counter": "/components/counter/counter"`，WXML 写入 `<counter />`。用微信开发者工具打开 `miniprogram`，初值 count=0，点击后依次为 count=1、count=2。

继续阅读[响应式与组合逻辑](guide.md)、[原生配置混用](native-options.md)或[共享状态](store.md)。

## 源码工作区

需要 Node 22+、npm，以及微信开发者工具。仓库使用 npm workspaces，不需要额外的 monorepo 编排器。

```sh
npm ci
npm run check
npm run dev
```

在微信开发者工具中打开 examples/integration。各宿主默认使用 touristappid；需要登录、分享等平台权限时，在本地项目配置中使用自己的 AppID，个人配置不提交。

npm run dev 持续将 packages 源码同步到宿主 vendor 目录。它只改写包导入路径，不转换 setup、WXML 或 WXSS。编辑 packages 后，开发者工具读取的就是当前实现，不需要发布包或手工复制。

普通业务只需从统一入口导入。宿主中的相对路径让微信原生工具直接读取源码。独立工程使用本地包体，并通过准备工具将包入口接入原生工程。

下面的代码直接来自可运行宿主：

<<< examples/integration/pages/index/index.js

对应原生模板：

<<< examples/integration/pages/index/index.wxml

请求、定时器等实例副作用放进生命周期 Hook；纯计算直接放在 setup 中。普通功能无需判断收集阶段或实例阶段。
