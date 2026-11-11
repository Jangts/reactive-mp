# Reactive MP

原生微信小程序的响应式与组合式开发工具。使用原生 JS、WXML、WXSS 和 Page/Component，增加 Signal、computed、watch、组合 Hook 与共享状态。无 Vue 方言、模板转换或生产中间代码。

同一个 setup 在注册时收集平台配置，在实例创建时建立响应式机制。普通使用无需区分阶段，原生静态配置与动态声明可以混用。

## 开发

需要 Node 22+、npm 和微信开发者工具。

```sh
npm ci
npm run check
npm run dev
```

在微信开发者工具中打开 examples/integration。npm run dev 持续同步当前工作区源码，宿主无需依赖已发布版本。

## 工作区

- packages/shared：通用工具。
- packages/reactivity：响应式内核。
- packages/store：惰性共享状态。
- packages/runtime：小程序运行时。
- packages/reactive-mp：统一入口。
- examples/playground、integration、scenarios：开发、复现与验证宿主。
- docs：文档正文；apps/docs：文档站。

## 文档

[开始开发](docs/getting-started.md) · [指南](docs/guide.md) · [配置混用](docs/native-options.md) · [Store](docs/store.md) · [API](docs/api.md) · [运行原理](docs/setup-runtime.md) · [验证记录](docs/verification.md)

```sh
npm run docs:dev
```

npm run docs:api 从真实导出与类型声明生成参考；npm run docs:check 验证同步、导航、链接和源码引用。

目前以工作区源码交付，未执行公开发布。自动化回归与真实微信环境验证分别记录。

License: ISC。
