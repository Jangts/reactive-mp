# Calendar 日历

在内嵌月视图中选择 YYYY-MM-DD 日期。

## 何时使用

需要同时查看相邻日期时使用。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/calendar/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Calendar">
    <rmp-field month="2026-11" />
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
/** Calendar documentation demo: native Page event wiring. */
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
/** Calendar documentation demo: reactive composition page. */
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

运行后可直接操作此 Calendar 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

month 选择显示月份，min/max 和 disabledDates 控制不可选日期；weekdays 可替换七个星期表头，应用可进行本地化。

### 明确选择范围

替换字段；没有显式 min 时，过去日期不会默认禁用。

```xml
<rmp-field month="2026-11" min="2026-11-01" max="2026-11-30" disabled-dates="{{disabledDates}}" />
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
| min | `string` | `""` | 最早日期或时间，格式与 mode 一致 |
| max | `string` | `""` | 最晚日期或时间，格式与 mode 一致 |
| month | `string` | `""` | 展示月份，格式 YYYY-MM |
| disabledDates | `array` | `[]` | 不可选日期，格式 YYYY-MM-DD |
| weekdays | `array` | `["日","一","二","三","四","五","六"]` | 从周日开始的七个表头文字 |

连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。

## 事件

| 事件 | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}；Upload 的 change 为 {value,path,source}。 |

## 插槽与样式

此 wrapper 不提供内容插槽。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |

## 常见问题与边界

不会默认禁用过去日期。日期使用 YYYY-MM-DD 字符串；范围与时区业务规则由应用定义。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
