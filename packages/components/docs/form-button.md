# FormButton 表单按钮

根据最近 Form 的待处理与禁用状态提交或重置。

## 何时使用

在 Form 内触发提交或重置，并跟随表单锁定状态。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/input/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="FormButton">
    <rmp-field placeholder="Name" maxlength="40" appearance="outline" />
  </rmp-form-item>
  <rmp-form-button>Submit</rmp-form-button>
  <rmp-form-button action="reset">Reset</rmp-form-button>
</rmp-form>
<text>{{result}}</text>
```

### index.js

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

```js [原生配置式]
/** FormButton documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: '',
    },
    result: '',
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values) });
  },
});
```

```js [组合响应式]
/** FormButton documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: '',
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

运行后可直接操作此 FormButton 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

action="reset" 恢复重置基线。requireValid="{{true}}" 只允许已知 valid 的状态，需配合 Form 的 validateOnMount 或显式静默校验。

### 已知有效才允许提交

下面片段放在已有 Form 内；同时在 Form 上设置 validate-on-mount="{{true}}"。

```xml
<rmp-form-button require-valid="{{true}}">Submit when valid</rmp-form-button>
<rmp-form-button action="reset">Restore initial values</rmp-form-button>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| action | `string` | `"submit"` | submit 或 reset |
| disabled | `boolean` | `false` | 禁用此按钮，不改变表单其他字段的校验状态。 |
| requireValid | `boolean` | `false` | 仅允许已知 valid 的 Form 触发提交 |


## 事件

此 wrapper 不额外声明自定义事件。

## 插槽与样式

可用插槽：`default`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

此 wrapper 不额外约定命令式实例方法。

## 常见问题与边界

默认提交按钮允许尚未校验的表单触发校验以显示错误。按钮只在 Form 内工作；组件不会等待 submit 事件监听器的 Promise。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
