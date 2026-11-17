# 原生配置与动态声明

definePage / defineComponent 接受 setup 函数与第二个原生 options 参数，也支持一个包含 setup 的原生配置对象。不传 setup 时可以直接提交原生配置。

| 配置 | 规则 |
| --- | --- |
| data / methods | setup 返回的同名项优先；Signal 和 carrier 交付数据，普通函数注册为方法 |
| properties | 静态与 defineProps 按键合并；动态同名项优先；defineProps() 可直接读取静态 schema |
| options | 静态与 defineOptions 按键合并，动态项优先；未知原生键透传 |
| behaviors | 保留原生标识或对象并去重合并，不用字符串白名单过滤原生 Behavior |
| externalClasses | 与 extClasses 去重合并 |
| relations | 按关系名合并，动态同名声明优先，调用对应实例处理函数 |
| lifetimes / pageLifetimes | 接管的事件组合原生处理函数与 Hook；由作用域维护订阅 |
| observers | 同源原生处理函数与 observe 回调均保留；props 更新同步到响应式值 |
| export | defineExpose 优先，否则使用原生 export，并加入必要 Behavior |
| 页面返回值回调 | Hook 优先，其次 setup 返回方法，再其次原生回调 |

重复 defineProps 允许合并，返回同一实例 carrier；已声明属性也会成为后续声明的基础。对同一个属性定义的配置，应在每次 setup 执行中保持一致。

页面和组件的区别由入口表达。defineComponentPage 用 Component 注册页面，保留组件能力并提供页面角色；context.page(result) 也可标记页面角色。普通页面使用 definePage，普通组件使用 defineComponent。

App 通过 defineApp 注册，setup 返回的 Signal 暴露到 globalData 时自动读取和更新。subscribeGlobalData、pickGlobalData、mapGlobalData、dispatchAppAction 用于复用这份状态及动作，不是另外一份 Store。

平台限制仍然成立：注册配置的结构在注册时固定，不能在某个实例出现之后新增 WXML 事件入口。实例创建早期的内部视图写入会等到 attached；依赖真实视图节点的操作应放入相应生命周期。

## 应用与节点移除

`defineApp(setup, nativeOptions)` 与 `defineApp({ ...nativeOptions, setup })` 组合原生配置。原生 globalData 和自定义实例字段保持各自位置，setup 返回的状态进入 globalData，函数成为动作。App 中使用 onLaunch、onShow、onHide、onAppError、onPageNotFound、onUnhandledRejection 和 onThemeChange；同一生命周期组合原生与 Hook 回调并保留原生 this。App setup 只执行一次，必须同步返回。

onBeforeDetach 在节点移除前运行，此时库停止视图提交；detached 仍完成全部资源清理。依赖真实节点的操作不要放到 beforeDetach 或销毁阶段。

setData 调用后逻辑数据和响应式状态已经同步；传入回调只表示原生渲染完成。纯数据字段由 pureDataPattern 指定，保留在逻辑层而不作为实例初值提交到视图。需要上屏的值必须可序列化，循环对象或函数在交付边界明确报错。


Behavior 属性由平台合并，实例阶段的 `defineProps()` 同时读取真实 `instance.properties`。内部 Behavior 的通配数据观察器负责同步继承属性和过滤器新增属性；不读取或展开平台私有 Behavior 标识。注册阶段尚无实例，依赖继承属性的派生结果必须容忍收集时字段缺失。相关实例隔离和更新回归见 tests/runtime.test.mjs。

integration 首页的“验证 Behavior 原生对照”打开 pages/behavior/index：两侧初值应为 count=4；同时增加后原生和组合式均为 count=5，第三个隔离实例仍为 count=4。该场景由 verify:wechat integration 执行，该场景已在基础库 3.8.10 开发者工具通过；不代表完整生命周期顺序或实机验收。


## 页面、组件渐进混用

integration 首页“原生与 reactive 混用示例”打开 `pages/mixed/index`。该页面保留原生 `data`、`incrementRaw` 和 `onLoad`，仅在 setup 中提供 `count`、`double`、`incrementReactive` 和 Hook。原生 `setData({ count })` 同步进入 Signal，派生值继续更新；独立原生字段 `vanilla` 继续用原生方式管理。同名返回项优先规则不变，建议字段和方法各自明确归属。

`components/mixed-counter/index` 同时保留原生 properties/data/methods/ready 和 setup。两个增加按钮分别使用 setData/triggerEvent 与 Signal/$emit，父页仍通过属性和 bind 事件通信；调用原生 ready 一次，移除时清理 setup 资源。

`pages/vanilla/index` 完全使用普通 Page，不依赖库；它与 definePage 页面都同时使用普通 Component、组合式组件和普通容器内的组合式子组件。点击“打开另一种页面”双向导航，隐藏页保留状态；“卸载/重建组件”用于检查新实例状态与旧订阅释放。特殊需求可继续使用原生组件，不要求迁移为 setup。

没有 setup 的 define 注册入口直接提交原生配置。含 setup 时才建立增强作用域；原生字段的 setData 保留平台回调路径，涉及 Signal 的根字段才进入同步反馈。组合式入口不是平台能力使用的唯一途径。
