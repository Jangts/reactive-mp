# Images Preloader

使用隐藏的原生 image 节点等待图片加载结果，支持有序批次、进行中请求共享、超时、卸载清理和已加载尺寸查询。

## 两种使用方式

普通 Page 可通过原生组件的方法 loadImages 取得批次结果。Reactive 页面也可以使用同一组件，或在 setup 中调用 useImagesPreloader 自己渲染节点。共享的逻辑负责请求与清理，项目决定什么时候预加载哪些图片。

需要微信原生宿主；运行依赖由 @reactive-mp/runtime 和 @reactive-mp/reactivity 提供。成功记录是本次运行的尺寸元数据，不是图片文件的持久缓存。

[快速上手](getting-started.md)提供页面 JSON、WXML 和 JS 接线；[使用指南](guide.md)说明结果、缓存、取消和 Hook；[API 参考](api.md)提供完整签名。
