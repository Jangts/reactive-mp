# FormItem 表单项

连接命名字段与 Form，承载标签、帮助和校验反馈。

## 何时使用

包裹一个逻辑字段；复合控件可用一个对象值占用一个路径。

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
  <rmp-form-item name="value" label="Name" help="Shown below the input" label-placement="left">
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
/** FormItem documentation demo: native Page event wiring. */
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
/** FormItem documentation demo: reactive composition page. */
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

运行后可直接操作此 FormItem 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

用 name 将内部控件连接至模型。labelPlacement="left" 将标签放在侧边；label、description、suffix、help、error 等插槽可组合自己的结构。

### 自定义标签与后缀

替换基础示例中的 FormItem；不要再同时设置非空 label 文字。

```xml
<rmp-form-item name="value" label="" label-placement="left">
  <text slot="label">Display name</text>
  <rmp-field placeholder="Name" />
  <text slot="suffix">Optional</text>
</rmp-form-item>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `unknown` | `""` | 字段路径，支持点号与数组下标 |
| label | `string` | `""` | 校验上下文与字段标签 |
| rules | `array` | `[]` | 字段规则；与 Form、FormItem 规则合并 |
| disabled | `boolean` | `false` | 禁用交互并退出字段校验 |
| readonly | `boolean` | `false` | 禁止交互，仍保留字段校验 |
| active | `boolean` | `true` | 字段是否激活；媒体内容项表示当前是否为激活项 |
| required | `boolean` | `false` | 标记必填并附加 required 规则；0、false 仍不是空值。 |
| description | `string` | `""` | 说明文字 |
| help | `string` | `""` | 没有可见错误时显示的帮助文字 |
| labelPlacement | `string` | `"top"` | 标签位置 top 或 left |


## 事件

此 wrapper 不额外声明自定义事件。

## 插槽与样式

可用插槽：`label`, `label-extra`, `description`, `default`, `suffix`, `error`, `help`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

此 wrapper 不额外约定命令式实例方法。

## 常见问题与边界

自定义 label、description 或 help 插槽时清空对应文字属性，避免两份内容。一个复合字段应只注册一个对象值，不要让多个字段重复占用同一路径。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
