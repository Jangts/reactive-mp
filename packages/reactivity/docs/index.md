# Reactivity

平台无关的响应式状态内核。Signal 表达单值，computed 派生状态，watch 与 watchEffect 连接副作用，effect scope 管理订阅与清理。不依赖 wx，也不负责页面注册或视图渲染。

## 从状态到副作用

| 任务 | 能力 |
| --- | --- |
| 读取和更新单值 | useSignal |
| 根据其他状态计算结果 | computed |
| 使用对象或 value 属性组织状态 | reactive、ref、mutable、signalized |
| 在变化后执行工作 | watch、watchEffect |
| 成组停止监听与资源 | createEffectScope、onScopeDispose |

[快速上手](getting-started.md)展示独立 Node 示例；[使用指南](guide.md)说明调度、旧值与资源寿命；[API 参考](api.md)覆盖包及公开子入口的真实签名。
