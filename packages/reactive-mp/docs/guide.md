# 响应式与组合逻辑

## 状态与派生值

useSignal(value) 返回读取函数与更新函数；读取 count()，更新 setCount(value)。computed(getter) 自动跟踪 getter 中读取的状态，同步更新派生值，禁止向派生计算中写入状态。computed 不需要手工列出依赖。

reactive(object) 支持嵌套对象与数组；ref(value) 通过 value 属性读写。reactive 会复用同一原始对象的代理身份。mutable(object) 返回可写 carrier 和批量 assign 函数；signalized(object) 返回只读 carrier 和 assign 函数。

## 监听与清理

watch(source, callback, options) 支持 Signal、getter、响应式对象和多个来源；回调收到当前值与上次交付值。同一微任务内的多次修改合并交付。immediate 首次回调的旧值为 undefined，once 表示只交付一次。返回句柄可 stop、pause、resume。watch 回调可以写回监听来源，只要更新最终收敛；同一刷新批次单个任务执行超过 100 次时报循环未收敛错误，该保护用于终止持续自激。computed 的 getter 仍禁止写入状态。

watchEffect 自动追踪同步读取，创建后立即执行；动态分支变化时放弃旧分支依赖。配置收集时 watch/watchEffect 不执行回调或建立订阅。手动停止 watch 也会释放为 getter 创建的内部计算；首次 watchEffect 抛错时解除已收集依赖。

setup 中创建的监听随实例销毁。createEffectScope 提供独立资源作用域；默认随父作用域清理，传入 true 创建独立作用域，调用方应负责 stop。作用域的 onDispose(handle) 登记清理并返回解除登记函数，解除登记不会执行清理。runInEffectFreeScope 是高级适配工具，在其中创建的状态不建立响应式订阅。

## 生命周期与原生实例

onLoad、onReady、onShow 等保留小程序的事件含义。onMounted 在页面 load 或组件 attached 后执行；onUnmounted 在 unload/detached 时清理。onBeforeMounted 在父子依赖连接时执行。通过 useCurrentInstance 获取当前实例，收集阶段返回 null；useCurrentPage 返回所在页面实例。

useSchedule(task, { interval, times, immediate }) 挂载后启动、销毁后停止。times 为 0 表示无限次；返回函数用于取消，restart 可重新开始，销毁后不会重启。

## 组件通信

props 用 defineProps 读取；$emit 对接原生 triggerEvent。provide/inject 支持字符串和 Symbol；子组件挂载时连接祖先提供的数据，默认值用于未找到提供者的情况。observe 可以组合原生 data 路径与 Signal。

onShareAppMessage、onShareTimeline 等需要返回值的回调直接返回给平台，优先采用 Hook，其次 setup 返回的方法，最后原生处理函数。多个注册取最后一次 Hook；不通过广播收集返回值。

可运行组件来源：

<<< examples/integration/components/probe/probe.js

声明型 Hook 必须在同步 setup 中调用；无活动上下文时会明确报错。useCurrentInstance/useCurrentPage 属于查询，缺少实例时返回 null。Signal.value 只读，状态写入使用更新函数。
