# 共享状态

@reactive-mp/store 只依赖响应式包，不依赖 wx 或页面生命周期。defineStore(id, setup) 返回惰性的 useStore；首次正常调用创建共享实例，后续调用复用。不同 defineStore 调用相互独立，id 用于标识，不是全局注册表。

配置收集阶段调用 useStore 时，只生成无副作用的临时形状，不提前启动共享实例。真正的 Store 作用域独立于页面，页面销毁不影响其他页面使用同一个 Store。

Store 保持原有 Signal/carrier 形式，不自动把 Signal 变为普通值。storeToRefs 选取响应式字段，方法保留在 Store 上。调用 store.$dispose() 或 useStore.dispose() 停止副作用并释放当前单例；再次 useStore 会重新创建。已有引用不再拥有活动副作用。

完整业务宿主使用同一页面的两个实例验证共享与返回行为：

<<< examples/scenarios/pages/index/index.js

不要在 store setup 中直接发请求或启动定时器；配置收集同样会执行这段函数。由实例生命周期或 action 启动业务副作用，用 onScopeDispose 管理 Store 自有资源。
