<p align="center"><img src="docs/assets/branding/reactive-mp-logo.svg" alt="Reactive MP" width="420"></p>

# Reactive MP

**响应式与组合式，留在原生。**

面向原生微信小程序的响应式与组合式开发工具。保留 JS、WXML、WXSS、JSON 和 Page/Component，用 Signal、computed、watch、组合 Hook 和共享状态组织业务逻辑。

[快速上手](docs/getting-started.md) · [使用指南](docs/guide.md) · [原生配置混用](docs/native-options.md) · [API 参考](docs/api.md) · [文档索引](docs/README.md)

## 开始使用

需要微信原生小程序宿主；包准备工具需要 Node.js 22+。支持源码工作区接入或安装本地 tarball，完整接线见[快速上手](docs/getting-started.md)；不假定包已发布到公共 registry。

依赖准备完成后，创建原生组件 `components/counter/counter.js`：

```js
import { defineComponent, useSignal, computed } from '../../vendor/reactive-mp/src/index.js';

defineComponent(() => {
  const [count, setCount] = useSignal(0);
  const label = computed(() => `count=${count()}`);
  return { label, increment: () => setCount(count() + 1) };
});
```

`counter.wxml`：

```xml
<button bindtap="increment">{{label}}</button>
```

`counter.json` 声明 `{ "component": true }`，页面 JSON 登记 `usingComponents` 后使用 `<counter />`。初值为 count=0，每次点击增加 1。导入路径假定准备目录为小程序根下的 `vendor`。

原生静态配置与 setup 声明可以混用；请求、定时器等实例副作用放入生命周期 Hook。WXML 和 WXSS 直接交给微信工具，不增加模板转换层。

## 按任务阅读

| 任务 | 入口 |
| --- | --- |
| 接入原生工程或运行工作区示例 | [快速上手](docs/getting-started.md) |
| 管理状态、派生值、监听与清理 | [响应式与组合逻辑](docs/guide.md) |
| 混合原生配置、生命周期与组件声明 | [原生配置与动态声明](docs/native-options.md) |
| 在多个页面共享状态 | [Store](docs/store.md) |
| 查公开函数和类型签名 | [API 参考](docs/api.md) |
| 理解注册收集、实例与视图同步 | [运行原理](docs/setup-runtime.md) |

## 包与职责

| 包 | 用途 |
| --- | --- |
| [reactive-mp](packages/reactive-mp/README.md) | 统一入口与原生依赖准备工具 |
| [@reactive-mp/reactivity](packages/reactivity/README.md) | Signal、computed、watch 与作用域 |
| [@reactive-mp/store](packages/store/README.md) | 惰性共享状态 |
| [@reactive-mp/runtime](packages/runtime/README.md) | 原生注册、setup 与小程序 Hook |
| [@reactive-mp/shared](packages/shared/README.md) | 通用工具 |
| [@reactive-mp/video](packages/video/README.md) | 视频组件、播放 Hook 与声音分组 |
| [@reactive-mp/swiper](packages/swiper/README.md) | 轮播组件、特征版式与内容组合 |

## 本地开发与文档站

使用 Node.js 22+、npm 和微信开发者工具：

```sh
npm ci
npm run dev
```

在微信开发者工具中打开 `examples/integration`。开发命令持续同步当前工作区源码到宿主；代码验收运行 `npm run check`。

```sh
npm run docs:dev
npm run docs:check
npm run docs:build
```

文档站提供全文搜索、明暗主题和移动端导航。正文来源为 `docs`，API 从真实导出和类型声明生成。内容维护、素材和静态部署见 [apps/docs](apps/docs/README.md)；架构、计划与验证记录从[维护者入口](docs/architecture.md)进入。

License: ISC。
