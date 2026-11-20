# Form 表单

管理模型、字段注册、校验与提交快照。

## 何时使用

多个输入需要统一校验并产生一个提交结果时使用。

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
  <rmp-form-item name="value" label="Form">
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
/** Form documentation demo: native Page event wiring. */
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
/** Form documentation demo: reactive composition page. */
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

运行后可直接操作此 Form 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

通过 model 接收外部快照，在 change 中回写 event.detail.values。用 initialValues 定义重置基线，reset(values) 可加载记录并建立新基线。

### 注册异步规则

在页面 onReady 注册函数，并在 data 中的规则通过名称引用；在基础示例的 Form 上增加 rules="{{rules}}"。

```js
onReady() {
  this.selectComponent('#form').setValidators({
    unique: async value => value === 'reserved' ? 'This name is reserved' : true,
  });
  this.setData({ rules: { value: [{ validator: 'unique' }] } });
}
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| model | `object` | `null` | 外部模型快照；相等回写不重复通知 |
| initialValues | `object` | `{}` | 初始化与 reset 的重置基线 |
| rules | `object` | `{}` | 字段路径到校验规则的映射，与 FormItem 和字段规则合并。 |
| disabled | `boolean` | `false` | 禁用交互并退出字段校验 |
| readonly | `boolean` | `false` | 禁止交互，仍保留字段校验 |
| submitting | `boolean` | `false` | 业务请求是否进行中，由普通页面同步 |
| validateOnMount | `boolean` | `false` | 挂载时执行首次校验 |


## 事件

| 事件 | event.detail |
| --- | --- |
| change | {values,path?,value?,previousValue?,source}。 |
| statechange | FormState 状态快照。 |
| validate | {status,values,errors}。 |
| submit | {values}，仅通过校验后触发。 |
| invalid | {status,values,errors,firstErrorPath}。 |
| reset | {values}，恢复后的模型。 |
| error | {type,message,...}，异常诊断。 |

## 插槽与样式

可用插槽：`default`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `getValues()` | 读取纯数据模型快照。 |
| `getFieldState(path)` | 读取指定字段的值、错误、校验和交互状态。 |
| `setFieldValue(path,value)` | 更新一个嵌套字段并驱动依赖与校验。 |
| `setValues(values)` | 合并顶层键，不建立新的 reset 基线。 |
| `setFieldError(path,message)` | 设置外部错误；message=null 清除。 |
| `hideErrors()` | 隐藏反馈，不修改字段是否有效。 |
| `validate(options?)` | 返回 Promise<{status,values,errors}>；options 含 paths、silent。 |
| `submit()` | 立即校验并提交；失败触发 invalid，返回提交结果 Promise。 |
| `reset(values?)` | 无参数恢复基线；传 values 加载新记录并重设基线。 |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |
| `setUploadAdapters(registry)` | 注册具名上传适配器，供 Upload 的 adapter 属性引用。 |

## 常见问题与边界

同一路径只能有一个字段所有者。异步校验返回 superseded 表示快照已变化；不要把它当作 valid。业务提交请求由应用管理，普通 Page 需要同步 submitting。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
