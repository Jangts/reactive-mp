# WeChat

Kit 内的微信原生 API 结果式封装与请求增强。可用于普通 Page、Component 或 Reactive MP；该领域逻辑不依赖响应式宿主，导入不启动登录、网络、弹窗或监听。

## 选择入口

| 入口 | 用途 |
| --- | --- |
| @reactive-mp/kit/wechat | 完整公开入口 |
| @reactive-mp/kit/wechat/wx | 登录、权限、路由、节点、缓存、文件与原生请求 |
| @reactive-mp/kit/wechat/network | 可配置请求客户端、重试入口与进行中请求控制 |

[快速上手](wechat-getting-started.md)说明原生工程接线；[结果与原生 API](wechat-guide.md)说明成功、失败和原生任务；[请求指南](wechat-network.md)说明拦截器与并发；[API 参考](api.md)提供完整类型。

AppID、权限、合法域名、业务鉴权与响应协议由应用提供。封装不绕过平台限制，不自动弹出业务提示或刷新身份。
