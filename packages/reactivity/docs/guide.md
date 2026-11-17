# 状态、监听与作用域

## 选择状态形式

useSignal(value) 返回读取函数与更新函数。Signal.value 只读；修改通过更新函数完成。computed(getter) 自动追踪同步读取的依赖，结果只读；不要在 getter 中写入状态。

reactive(object) 追踪对象的嵌套读写和数组变化，同一原始对象复用代理。ref(value) 使用 value 属性读写。mutable 和 signalized 提供 carrier 与批量赋值能力，适合按属性组合；具体只读和赋值类型见[API 参考](api.md)。

## 监听与调度

watch 支持 Signal、getter、响应式对象和多个来源，回调接收当前值与上一次交付值。同一微任务内的变化合并；immediate 首次回调的旧值为 undefined，once 表示只交付一次。返回的句柄可调用停止，也提供 stop、pause、resume。

watchEffect 立即执行并自动追踪同步读取；分支改变时放弃旧分支依赖。异步函数在 await 之后的读取不属于前一段同步依赖收集。

watch 回调允许最终收敛的写回；持续自激会触发循环保护。computed 只负责派生，不承载这种写回副作用。异常继续交付调用者；创建阶段失败会释放已经收集的订阅。

## 作用域与清理

```js
import { createEffectScope, onScopeDispose, useSignal, watch } from '@reactive-mp/reactivity';

const [enabled, setEnabled] = useSignal(false);
const scope = createEffectScope();
scope.run(() => {
  watch(enabled, value => console.log(value));
  onScopeDispose(() => console.log('released'));
});
setEnabled(true);
await Promise.resolve();
scope.stop();
```

普通作用域归当前父作用域管理；createEffectScope(true) 创建独立作用域，由调用方负责 stop。scope.onDispose(handle) 返回解除登记函数；解除登记不执行清理。不要让脱离宿主寿命的订阅永久存在。

## 适配边界

本包不访问页面和 wx，也不会自动把状态提交到 WXML。原生页面接线由 reactive-mp 运行时完成，其他宿主自行提供视图适配。runInEffectFreeScope 是高级适配工具：其中的求值不建立响应式订阅，不能用它替代正常业务作用域。
