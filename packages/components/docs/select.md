# Select 选择器

通过原生 picker 或确认弹窗选择映射后的选项值。

## 何时使用

用于较长选项列表；多选使用 popup 模式。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/select/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Select">
    <rmp-field options="{{options}}" presentation="native" />
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
/** Select documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: 'bj',
    },
    result: '',
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
      },
    ],
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
/** Select documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: 'bj',
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
      },
    ],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

运行后可直接操作此 Select 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

presentation="native" 使用原生单选。presentation="popup" 配合 multiple="{{true}}" 使用多选确认弹窗，勾选只改草稿，确认后才更新模型。

### 弹窗多选与取消

先在 Page 中把 model.value 初始化为 []，再替换字段；取消不会提交草稿。

```xml
<rmp-field options="{{options}}" presentation="popup" multiple="{{true}}" title="Choose cities" />
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `unknown` | `""` | 字段路径，支持点号与数组下标 |
| label | `string` | `""` | 校验上下文与字段标签 |
| value | `unknown` | `null` | 独立字段的外部同步值 |
| defaultValue | `unknown` | `null` | 独立字段的初始值 |
| rules | `array` | `[]` | 字段规则；与 Form、FormItem 规则合并 |
| required | `boolean` | `false` | 标记必填并附加 required 规则；0、false 仍不是空值。 |
| disabled | `boolean` | `false` | 禁用交互并退出字段校验 |
| readonly | `boolean` | `false` | 禁止交互，仍保留字段校验 |
| active | `boolean` | `true` | 字段是否激活；媒体内容项表示当前是否为激活项 |
| preserve | `boolean` | `true` | 字段卸载后是否保留模型值 |
| validateOn | `string` | `""` | 覆盖交互校验时机；文本默认 blur，其他字段默认 change |
| appearance | `string` | `"plain"` | plain、underline 或 outline 的基础外观 |
| placeholder | `string` | `"请选择"` | 未输入或未选择时的提示 |
| options | `array` | `[]` | 选项；通常为 label、value、disabled，多列时为二维数组 |
| labelKey | `string` | `"label"` | 选项显示文字对应的键 |
| valueKey | `string` | `"value"` | 选项值对应的键 |
| childrenKey | `string` | `"children"` | 树形子选项对应的键 |
| variant | `string` | `"list"` | list 或 buttons；Upload 使用基础布局类 |
| collapseAfter | `number` | `0` | 正数时折叠超出数量的选项，0 不折叠 |
| columns | `number` | `1` | 选项布局列数 |
| presentation | `string` | `"native"` | native 或 popup，多选使用 popup |
| multiple | `boolean` | `false` | 弹窗中是否允许多选 |
| title | `string` | `""` | 标题文字 |

连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。

## 事件

| 事件 | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}；Upload 的 change 为 {value,path,source}。 |
| open | 当前值；close 还包含 reason。 |
| close | 当前值；close 还包含 reason。 |
| cancel | 当前值；close 还包含 reason。 |

## 插槽与样式

可用插槽：`summary`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |

## 常见问题与边界

取消弹窗丢弃草稿。多选需要数组模型；单选输出选项值，原生滚轮索引不会进入模型。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
