# Reactive MP 文档

各公开包独立提供随包使用文档与 API 参考，版本随各包独立维护。Reactivity 的在线指南与 API 统一由 Reactive MP 主站提供，其 npm 包仍独立发布；其他公开包各自提供文档站。按实际需要选择响应式内核、原生运行时入口、共享状态或可选扩展。

## 选择能力

| 包 | 用途 | 文档 |
| --- | --- | --- |
| reactive-mp | 微信原生注册与组合式开发入口 | [开始使用](../packages/reactive-mp/docs/index.md) |
| @reactive-mp/reactivity | 平台无关的响应式状态与作用域 | [开始使用](../packages/reactivity/docs/index.md) |
| @reactive-mp/store | 惰性共享状态与资源寿命 | [开始使用](../packages/store/docs/index.md) |
| @reactive-mp/kit | 微信 API、图片预加载与 Store 转发 | [开始使用](../packages/kit/docs/index.md) |
| @reactive-mp/components | 表单、视频和轮播的无头交互能力 | [开始使用](../packages/components/docs/index.md) |

## 维护源码

[架构与贡献](architecture.md) · [文档索引](README.md) · [工作区 API](api.md)。runtime、shared 是共用内部支撑包，其说明保留在维护入口。
