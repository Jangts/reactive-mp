# setup 运行模型（进阶）

reactive-mp 是原生微信小程序的运行时增强库。源码直接在小程序中运行，无模板转换、源代码分析器或中间代码。WXML、WXSS 和原生配置仍由微信处理。

## 一次收集，多次实例化

`definePage` / `defineComponent` 注册时运行一次 setup，收集原生平台注册所需的配置、数据初值和方法入口。这里的“静态分析”是执行收集，不是解析 JavaScript 源码。

每个实例创建时再运行 setup，创建自己的状态、方法闭包和生命周期监听。运行时把注册入口转发到对应实例，将实例实际产生的数据同步到视图。收集结果不是实例间共享的可变状态。

普通业务无需判断阶段：

- Signal 和 computed 在收集时可求值，以生成注册数据。
- watch、watchEffect 在收集时不执行回调，也不建立订阅。
- 生命周期 Hook 在实例上执行；useSchedule 在挂载后启动、销毁时清理。
- defineProps 在收集时返回默认值，在实例时读取实际 properties，并接收后续变化。
- provide/inject 在实例挂载时建立父子连接，销毁时解除订阅。
- defineOptions、behaviors、extClasses、defineRelation 等声明由收集阶段产生原生配置。

## 原生配置与动态声明可以混用

可用 `defineComponent(setup, nativeOptions)`，也可用 `defineComponent({ ...nativeOptions, setup })`。不传 setup 时继续注册原生配置。

同名配置由 setup 声明覆盖原生配置；properties、options、relations 按键合并，externalClasses 去重合并。setup 返回的同名 data 和方法优先。已接管的生命周期与 observer 会同时调用原生处理函数和实例 Hook，不因增加响应式能力丢掉原生处理函数。

静态 properties 可以通过 `defineProps()` 读取，无需重复声明 schema；动态声明用 `defineProps({ ... })`。不要根据实例属性条件改变注册结构：同一组件的 properties、方法名等在所有实例间应保持一致。

## 需要理解阶段的边界

运行时只能管理经过本库 API 的行为。直接在 setup 函数体里调用 wx.request、setInterval、写存储等，仍会在收集时执行。实例副作用应放入 onMounted/onLoad 等生命周期；纯计算可以直接写在 setup 中。这一边界也适用于组合 Hook。

setup 是同步函数；异步工作放入方法或生命周期回调。收集时 `$this` / useCurrentInstance() 没有真实实例，返回 null；需要原生实例的操作放入生命周期中。

`isSettingUpOptions` / `isSettingUpInstance` 供高级适配使用，为不可枚举属性。普通业务不必读取它们。它们可以区分求值阶段，但不能让注册后才出现的新方法名或 properties 生效。


## 注册结构一致性

Page/Component 的 setup 收集和实例执行必须声明相同的平台结构。可变化的是实例数据和回调闭包；返回字段名称及 data/method 分类、props、原生路径 observer、relations、options、Behavior 身份、externalClasses、页面标记和平台 Hook 必须保持一致。条件业务放进回调，不依据实例属性条件增加平台注册入口。不一致会在绑定前抛出 TypeError 并清理 setup 资源。纯 Signal watch、依赖注入和实例挂载/清理副作用不属于平台注册结构。详见[平台计划的定案合同](platform-coverage.md#八定案合同与执行门槛)。
