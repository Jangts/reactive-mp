# DatePicker 日期时间选择器

通过原生 picker 选择日期或时间。

## 何时使用

需要紧凑的日期时间输入与明确范围时使用。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/date-picker/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="DatePicker">
    <rmp-field mode="date" min="2026-01-01" max="2027-12-31" />
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
/** DatePicker documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: '2026-11-18',
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
/** DatePicker documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: '2026-11-18',
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

运行后可直接操作此 DatePicker 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

mode="date" 使用 YYYY-MM-DD，mode="time" 使用 HH:mm。min/max 与 mode 的格式保持一致；fields 可设置日期精度。

### 时间选择

将 model.value 改为 HH:mm，例如 09:00，再使用此字段。

```xml
<rmp-field mode="time" min="09:00" max="18:00" default-picker-value="09:00" />
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
| placeholder | `string` | `"请选择"` | 未输入或未选择时的提示 |
| mode | `string` | `"date"` | date 或 time |
| min | `string` | `""` | 最早日期或时间，格式与 mode 一致 |
| max | `string` | `""` | 最晚日期或时间，格式与 mode 一致 |
| fields | `string` | `"day"` | 原生日期精度 year、month 或 day |
| defaultPickerValue | `string` | `""` | 无模型值时滚轮的初始定位 |

连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。

## 事件

| 事件 | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}；Upload 的 change 为 {value,path,source}。 |
| cancel | 原生 picker 取消，包含当前值。 |

## 插槽与样式

此 wrapper 不提供内容插槽。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |

## 常见问题与边界

defaultPickerValue 只在没有模型值时定位滚轮，不等于提交值。需要业务校验时另配规则，不要只依赖选择范围。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
