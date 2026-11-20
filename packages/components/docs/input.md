# Input 输入框

使用原生键盘和焦点事件编辑单行文本。

## 何时使用

用于名称、标识和短文本。

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
  <rmp-form-item name="value" label="Input">
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
/** Input documentation demo: native Page event wiring. */
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
/** Input documentation demo: reactive composition page. */
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

运行后可直接操作此 Input 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

设置 type="number" 切换键盘；password 用于密码输入。maxlength="-1" 不额外限制长度。outline 与 underline 可作为轻量外观，布局由 FormItem 管理。

### 密码与只读

替换示例中的字段即可；type 只改变键盘，不执行数值转换。

```xml
<rmp-field password="{{true}}" maxlength="64" confirm-type="done" appearance="underline" />
<!-- For readonly display, set readonly="{{true}}" instead. -->
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `unknown` | `""` | 字段路径，支持点号与数组下标 |
| label | `string` | `""` | 校验上下文与字段标签 |
| value | `unknown` | `null` | 独立字段的外部同步值 |
| defaultValue | `string` | `""` | 独立字段的初始值 |
| rules | `array` | `[]` | 字段规则；与 Form、FormItem 规则合并 |
| required | `boolean` | `false` | 标记必填并附加 required 规则；0、false 仍不是空值。 |
| disabled | `boolean` | `false` | 禁用交互并退出字段校验 |
| readonly | `boolean` | `false` | 禁止交互，仍保留字段校验 |
| active | `boolean` | `true` | 字段是否激活；媒体内容项表示当前是否为激活项 |
| preserve | `boolean` | `true` | 字段卸载后是否保留模型值 |
| validateOn | `string` | `""` | 覆盖交互校验时机；文本默认 blur，其他字段默认 change |
| appearance | `string` | `"plain"` | plain、underline 或 outline 的基础外观 |
| placeholder | `string` | `"请输入"` | 未输入或未选择时的提示 |
| type | `string` | `"text"` | 原生输入类型，默认 text |
| maxlength | `number` | `-1` | 最大字符数；-1 不附加上限 |
| autoHeight | `boolean` | `true` | Textarea 是否随内容增高 |
| showCount | `boolean` | `false` | Textarea 是否显示字数 |
| focus | `boolean` | `false` | 原生焦点状态，实际行为受平台限制 |
| adjustPosition | `boolean` | `true` | 键盘弹起时是否自动上推 |
| confirmType | `string` | `"done"` | 原生键盘确认按钮类型 |
| password | `boolean` | `false` | 是否使用密码输入 |

连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。

## 事件

| 事件 | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}；Upload 的 change 为 {value,path,source}。 |
| input | 保留原生 detail，并附加字段 path。 |
| focus | 保留原生 detail，并附加字段 path。 |
| blur | 保留原生 detail，并附加字段 path。 |
| confirm | 保留原生 detail，并附加字段 path。 |

## 插槽与样式

此 wrapper 不提供内容插槽。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |

## 常见问题与边界

键盘类型不会把模型自动转换成 number。文本默认 blur 校验；已有可见错误时，后续输入会重新检查未指定 trigger 的规则。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
