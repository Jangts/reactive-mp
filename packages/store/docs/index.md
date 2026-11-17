# Store

基于响应式作用域的惰性共享状态。每个 defineStore 定义拥有一个可释放的共享实例，多个调用方复用状态和动作；实例不随某个页面的销毁而结束。

## 适用范围

可以独立在 JavaScript 工程使用，也可以连接原生微信页面。运行依赖是 @reactive-mp/reactivity 与 @reactive-mp/shared，不要求 wx。id 是定义标识，不是把同名定义合并的全局注册表。

[快速上手](getting-started.md)提供完整共享计数器；[使用指南](guide.md)说明惰性创建、动作身份与释放；[API 参考](api.md)说明类型和返回值。
