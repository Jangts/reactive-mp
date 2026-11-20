<p align="center"><img src="docs/assets/branding/reactive-mp-logo.svg" alt="Reactive MP" width="420"></p>

# Reactive MP

**响应式与组合式，留在原生。**

面向原生微信小程序的响应式与组合式开发工具。保留 JS、WXML、WXSS、JSON 和 Page/Component，用 Signal、computed、watch、组合 Hook 和共享状态组织业务逻辑。

[快速上手](packages/reactive-mp/docs/getting-started.md) · [使用指南](packages/reactive-mp/docs/guide.md) · [原生配置混用](packages/reactive-mp/docs/native-options.md) · [API 参考](packages/reactive-mp/docs/api.md) · [文档索引](docs/README.md)

## 开始使用

需要微信原生小程序宿主；包准备工具需要 Node.js 22+。支持源码工作区接入或安装本地 tarball，完整接线见[快速上手](packages/reactive-mp/docs/getting-started.md)；不假定包已发布到公共 registry。

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
| 接入原生工程或运行工作区示例 | [快速上手](packages/reactive-mp/docs/getting-started.md) |
| 管理状态、派生值、监听与清理 | [响应式与组合逻辑](packages/reactive-mp/docs/guide.md) |
| 混合原生配置、生命周期与组件声明 | [原生配置与动态声明](packages/reactive-mp/docs/native-options.md) |
| 在多个页面共享状态 | [Store](packages/store/docs/guide.md) |
| 查公开函数和类型签名 | [API 参考](packages/reactive-mp/docs/api.md) |
| 理解注册收集、实例与视图同步 | [运行原理](packages/reactive-mp/docs/setup-runtime.md) |

## 包与职责

| 包 | 用途 |
| --- | --- |
| [reactive-mp](packages/reactive-mp/README.md) | 统一入口与原生依赖准备工具 |
| [@reactive-mp/reactivity](packages/reactivity/README.md) | Signal、computed、watch 与作用域 |
| [@reactive-mp/store](packages/store/README.md) | 惰性共享状态 |
| [@reactive-mp/runtime](packages/runtime/README.md) | 原生注册、setup 与小程序 Hook |
| [@reactive-mp/shared](packages/shared/README.md) | 通用工具 |
| [@reactive-mp/components](packages/components/README.md) | 无头组件能力：表单、视频、轮播的 Hooks 与原生 wrappers |
| [@reactive-mp/kit](packages/kit/README.md) | 微信 API、图片预加载及独立 Store 包的转发入口 |

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
npm run docs:dev -- --package @reactive-mp/components
```

各公开包在自己的 `docs` 中提供随 npm 包交付的概览、接入、指南与 API。Reactivity 的在线文档由主包站点承载，其 npm 包和版本独立维护；其余公开包拥有各自站点。文档站提供完整中英文内容、按语言检索、明暗主题、移动导航和版本标识。完整构建在 `apps/docs/dist/<站点所属包目录名>` 生成独立产物。内容维护、素材和部署见 [apps/docs](apps/docs/README.md)；架构、计划与验证记录从[维护者入口](docs/architecture.md)进入。

线上文档：[Reactive MP](https://reactive-mp-docs.pages.jangts.cafe/) · [Reactivity（主站）](https://reactive-mp-docs.pages.jangts.cafe/reactivity-index.html) · [Store](https://reactive-mp-store-docs.pages.jangts.cafe/) · [Kit](https://reactive-mp-kit-docs.pages.jangts.cafe/) · [Components](https://reactive-mp-components-docs.pages.jangts.cafe/)。

License: ISC。
