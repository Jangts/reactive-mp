# Upload 文件上传

选择图片或视频，通过应用适配器协调上传任务。

## 何时使用

文件属于表单且未完成上传需要阻止提交时使用。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/upload/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Upload">
    <rmp-field max-count="3" accept="{{accept}}" />
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
/** Upload documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: [],
    },
    result: '',
    accept: ['image'],
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
/** Upload documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: [],
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    accept: ['image'],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

运行后可直接操作此 Upload 示例；修改字段后点击 Submit，页面显示提交的模型；Reset 恢复初始值。

## 常用场景

不配置 adapter 时只选择本地文件。上传时在 Form.setUploadAdapters 注册名称，或在独立 Upload 上调用 setAdapter；适配器返回 {result,abort?}，进度通过 onProgress 上报。

### 手动上传

在示例字段添加 id="upload" 和 auto-upload="{{false}}"。在 Page 的 onReady 中给独立 Upload 注册适配器；连接 Form 时也可用 Form.setUploadAdapters。

```js
onReady() {
  const upload = this.selectComponent('#upload');
  upload.setAdapter((file, { onProgress }) => {
    let task;
    const result = new Promise((resolve, reject) => {
      task = wx.uploadFile({ url: 'https://your-upload-domain.example/upload',
        filePath: file.tempFilePath, name: 'file',
        success: response => {
          try { resolve({ url: JSON.parse(response.data).url }); } catch (error) { reject(error); }
        }, fail: reject });
      task.onProgressUpdate(event => onProgress(event.progress));
    });
    return { result, abort: () => task.abort() };
  });
}
// In another Page handler: this.selectComponent('#upload').upload();
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| name | `unknown` | `""` | 字段路径，支持点号与数组下标 |
| label | `string` | `""` | 校验上下文与字段标签 |
| value | `unknown` | `null` | 独立字段的外部同步值 |
| defaultValue | `array` | `[]` | 独立字段的初始值 |
| rules | `array` | `[]` | 字段规则；与 Form、FormItem 规则合并 |
| required | `boolean` | `false` | 标记必填并附加 required 规则；0、false 仍不是空值。 |
| disabled | `boolean` | `false` | 禁用交互并退出字段校验 |
| readonly | `boolean` | `false` | 禁止交互，仍保留字段校验 |
| active | `boolean` | `true` | 字段是否激活；媒体内容项表示当前是否为激活项 |
| preserve | `boolean` | `true` | 字段卸载后是否保留模型值 |
| validateOn | `string` | `""` | 覆盖交互校验时机；文本默认 blur，其他字段默认 change |
| appearance | `string` | `"plain"` | plain、underline 或 outline 的基础外观 |
| placeholder | `string` | `"请选择"` | 未输入或未选择时的提示 |
| accept | `array` | `["image"]` | 允许选择 image、video |
| adapter | `string` | `""` | 从 Form 注册表解析的上传适配器名称 |
| maxCount | `number` | `9` | 允许选择的文件总数 |
| maxSize | `number` | `0` | 文件大小上限，字节；0 不额外限制 |
| typeLimits | `object` | `{}` | 按 image、video 分别设置数量和大小限制 |
| autoUpload | `boolean` | `true` | 选择后是否立即调用适配器上传 |
| retryCount | `number` | `0` | 失败后的自动重试次数 |
| title | `string` | `""` | 标题文字 |
| description | `string` | `""` | 说明文字 |

连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。

## 事件

| 事件 | event.detail |
| --- | --- |
| change | {value,path,source}。 |
| select | {file}。 |
| uploadstart | {file,attempt}。 |
| progress | {id,progress}，progress 为百分比。 |
| uploadsuccess | {file}。 |
| uploaderror | {file,message}。 |
| remove | {id}。 |
| preview | {file}，应用决定如何预览。 |
| error | {type:"selection",message}，原生选择失败。 |

## 插槽与样式

可用插槽：`add`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `setValidators(registry)` | 注册供字符串规则引用的函数，不通过 WXML 传函数。 |
| `setMessages(messages)` | 设置规则消息文本。 |
| `upload()` | 上传当前待上传文件，返回 Promise<结果数组>。 |
| `retry(id)` | 按文件 id 重试失败任务。 |
| `remove(id)` | 按 id 移除文件并解除相应提交阻塞。 |
| `addFiles(files)` | 添加应用提供的文件，并按 autoUpload 策略处理。 |
| `setAdapter(adapter)` | 在逻辑层为当前 Upload 实例设置适配器函数。 |

## 常见问题与边界

未完成、失败的上传任务阻止提交；删除文件解除阻塞。服务地址、认证、预览和错误提示由应用管理，不能在 data/WXML 传函数适配器。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
