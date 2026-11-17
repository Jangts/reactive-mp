# @reactive-mp/components/form

统一组件包的表单领域。Form 管理模型和校验，FormItem 提供标签与反馈，字段提供可选的原生 wrappers。页面使用普通 Page 或 Reactive Page 均可；自定义结构可直接组合 Hooks。

## 接入

安装的是 `@reactive-mp/components`，form 是领域子入口。运行依赖为 `@reactive-mp/runtime@1.0.0` 和 `@reactive-mp/reactivity@1.0.0`，两者依赖 `@reactive-mp/shared@1.0.0`。取得四个匹配版本的 tarball 后，在小程序 npm 工程安装：

```sh
npm install ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
```

在微信开发者工具构建 npm 后，在页面 JSON 配置：

```json
{
  "usingComponents": {
    "rmp-form": "@reactive-mp/components/form/components/form/index",
    "rmp-form-item": "@reactive-mp/components/form/components/form-item/index",
    "rmp-input": "@reactive-mp/components/form/components/input/index",
    "rmp-form-button": "@reactive-mp/components/form/components/form-button/index"
  }
}
```

```js
Page({
  data: {
    model: { name: '' },
    rules: { name: [{ required: true, message: '请输入名称' }] },
  },
  onChange(event) { this.setData({ model: event.detail.values }); },
  onSubmit(event) { console.log(event.detail.values); },
});
```

```xml
<rmp-form id="form" model="{{model}}" rules="{{rules}}"
  bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="name" label="名称">
    <rmp-input placeholder="请输入名称" appearance="outline" />
  </rmp-form-item>
  <rmp-form-button action="submit">提交</rmp-form-button>
</rmp-form>
```

输入时更新模型，提交时校验并将纯数据快照放入 `event.detail.values`。Reactive Page 使用相同的 JSON/WXML，使用 Signal 保存 model，并在 onChange 中更新 Signal。

## 模型和作用域

Form 独占规范模型。initialValues 初始化重置基线，model 是外部同步快照：编辑先更新内部模型再发 change，相等的外部回写不会重复通知。`reset(values)` 加载数据并建立新基线，`reset()` 恢复基线。`setValues` 合并顶层键，`setFieldValue(path, value)` 更新嵌套字段。

字段从命名 FormItem 继承 name，也可直接声明 name；同一路径只能有一个所有者。连接 Form 后从模型读取值；独立字段使用 value/defaultValue。name 支持 `contact.email`、`rows[0].text`，JS 也支持路径段数组。

validate 检查注册且 active、未禁用的字段。readonly 禁止交互但继续校验。卸载默认保留值，preserve=false 删除值；保留值仍在提交快照中。active=false 可让仍挂载的字段退出校验与阻塞。

## 字段与版式

| 组件路径末段 | 能力和主要属性 |
| --- | --- |
| input / textarea | maxlength=-1 不附加上限，focus、adjustPosition、confirmType；textarea 支持 autoHeight、showCount |
| checkbox / switch | Boolean 值与标签插槽；false 是合法值 |
| radio-group / checkbox-group | options，variant=list/buttons，collapseAfter=0 默认不折叠 |
| select | presentation=native/popup；multiple 供弹窗多选；title、options |
| column-picker | options 为各列选项数组，输出每列选中的值 |
| date-picker | mode=date/time，min/max、fields、defaultPickerValue |
| region-picker | 原生地区选择，level；change 保留原生编码详情 |
| cascader | 树形 options、childrenKey；缺少 children 时发 loadchildren，由外部补 options；叶子以 children=[] 表示 |
| calendar | month、min/max（YYYY-MM-DD）、disabledDates、weekdays；不预先禁止过去日期 |
| upload | FileValue[]、accept、maxCount、maxSize、adapter、autoUpload、retryCount、typeLimits |

选项默认 `{label,value,disabled?}`，value 为 string/number，可用 labelKey/valueKey 映射。零值不会丢失。单选输出值，多选输出值数组；原生滚轮索引不进入模型。弹窗勾选只改变草稿，确认后提交，取消丢弃。

字段 appearance 为 plain、underline 或 outline。FormItem 提供 label、label-extra、description、suffix、help、error 插槽；自定义 label/description/help 时清空对应文字属性，避免同时显示。错误优先于 help，反馈在正常文档流中。`custom-class` 和 `--form-*` CSS 变量可调整外观，不依赖全局字体或图标。

## 校验与事件

内建规则有 required、type、accepted、minLength/maxLength、min/max、pattern/flags；约束与自定义 validator 分别执行一次。required 不把 0/false 视为空，必须勾选使用 accepted。

validator 返回 true 或空串通过，false 使用默认文案，非空字符串表示错误；异步使用相同返回协议。规则按 Form、FormItem、Field 顺序合并。Input/Textarea 默认 blur，其他字段默认 change；trigger 可覆盖，已有可见错误的文本字段会在 input 时重新检查未指定 trigger 的规则。

普通页面在 onReady 中调用 `selectComponent('#form').setValidators({ unique: async (value, context) => true })`，规则用 `{validator:'unique'}` 引用。函数不通过 WXML/data 传递。Hooks 可直接传函数或 options.validators。dependencies 指定关联字段；debounce 只对交互触发生效，提交立即校验。

`validate({paths?,silent?})` 返回 `{status,values,errors}`，status 为 valid、invalid 或 superseded。值、规则、字段或 reset 改变会终止旧批次的状态写回。errors 为含 path 段数组、message、source 的数组。`setFieldError(path,message)` 设置外部错误，null 清除；不会被一次提交校验抹掉。`hideErrors()` 只隐藏反馈，不使无效字段变有效。

Form 提供 change、statechange、validate、submit、invalid、reset、error。字段保留 input/focus/blur/confirm 的原始 detail，change 附 value、previousValue、path、source。Select 提供 open/close/cancel。事件默认不冒泡，Form 自行汇总字段变更。

FormButton 默认允许点击未通过校验的表单，以显示错误。requireValid=true 只允许已知 valid，需配合 validateOnMount=true 或显式静默校验。submitting 属性由普通页面接入业务请求状态，组件不会等待事件监听器的 Promise。

## Hooks 和原生控件

```js
import { definePage } from '@reactive-mp/runtime';
import { useForm, useField } from '@reactive-mp/components/form';

definePage(() => {
  const form = useForm({ initialValues: { name: '' }, rules: { name: [{ required: true }] } });
  const name = useField({ name: 'name' }, { form, validateOn: 'blur' });
  return {
    name: name.value,
    error: name.errorMessage,
    onInput: name.onInput,
    onBlur: name.onBlur,
    submit: form.handleSubmit(async values => console.log(values)),
  };
});
```

```xml
<input value="{{name}}" bindinput="onInput" bindblur="onBlur" />
<text>{{error}}</text>
<button bindtap="submit">提交</button>
```

useField 显式连接 form 可直接用于 Page。自定义 Reactive 字段在 Component setup 调用 `useField(props,{scope:true})`，通过原生关系连接最近 Form/Item；自定义表单容器用 `useForm(props,{scope:true})`。一个复合字段可以组合多个原生控件，只注册一个对象值。

其他 Hooks：useChoice、useSelect、useCascader、useCalendar、useUpload，以及 `useFieldArray(form,path,{itemKey?})`。FieldArray 提供 rows、append/remove/move/replace，rows 含稳定 key 和当前路径；move/remove 对齐字段状态。无 itemKey 的整表替换会重建行身份。

Hook 的值为 Signal。只把模板需要的 Signal 和方法返回给页面，控制器与任务留在逻辑层。handleSubmit(handler) 会 await 业务处理并在 finally 解锁；同一实例不接受重叠提交。

## 上传适配器

未指定 adapter 时只选择文件，值含 tempFilePath。指定名称后从 Form.setUploadAdapters 注册表解析，默认选中即上传；独立 Upload 用 setAdapter，Hook 用 options.adapter。

```js
const adapter = (file, { onProgress }) => {
  let task;
  const result = new Promise((resolve, reject) => {
    task = wx.uploadFile({
      url: 'https://your-upload-domain.example/upload',
      filePath: file.tempFilePath,
      name: 'file',
      success(response) {
        try { resolve({ url: JSON.parse(response.data).url }); }
        catch (error) { reject(error); }
      },
      fail: reject,
    });
    task.onProgressUpdate(event => onProgress(event.progress));
  });
  return { result, abort: () => task.abort() };
};
```

请求地址、认证与响应格式由应用提供。FileValue 始终是数组项 `{id,type,url?,tempFilePath?,name?,size?,poster?}`。上传成功才写模型；待上传、进行中或失败任务阻塞提交，删除解除阻塞。默认 accept=['image']、maxCount=9、maxSize=0 不额外限制、retryCount=0；typeLimits 可分别限制图片与视频。

组件通过 select/uploadstart/progress/uploadsuccess/uploaderror/remove/preview 报告状态，预览、Toast、全页 Loading 由外部处理。任务按选择顺序提交，取消和卸载后迟到的结果不能恢复文件。

## 开发与验证

源码按 components、hooks、utils 组织。工作区 `npm run examples:prepare` 后，从 integration 首页进入 Form 示例，包含普通页面、Reactive 页面、原生 Hooks 和全部字段/自定义字段/多表单组合。

自动化覆盖控制器、异步规则、任务、关系接线、类型和独立包消费。原生关系与插槽顺序、键盘、弹窗、真实选文件及微信 npm 构建仍需开发者工具和真机验收。
