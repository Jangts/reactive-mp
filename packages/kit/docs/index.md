# Reactive MP Kit

为原生微信小程序提供微信 API 封装、图片预加载和共享 Store 入口。项目自行控制业务请求、鉴权和视觉结构。

| 任务 | 入口与文档 |
| --- | --- |
| 登录、路由、缓存、文件、原生网络任务 | [Wechat](wechat.md) |
| 请求客户端、错误处理与并发控制 | [请求增强](wechat-network.md) |
| 批次预加载图片、共享请求与查询尺寸 | [Images Preloader](images-preloader.md) |
| 跨页面共享状态和资源清理 | [Store 转发](store.md) |

[快速上手](getting-started.md)说明包体安装和原生源码接入；[能力指南](guide.md)说明领域选择；[API 参考](api.md)覆盖根入口与各子入口的真实签名。

Wechat、Images Preloader 的代码和文档由 kit 直接提供。Store 由独立的 @reactive-mp/store 提供，kit 只转发它的接口和类型。
