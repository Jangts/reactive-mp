# Hooks 与控制器

Hooks 在同步 setup 中声明，纯控制器可不依赖原生宿主使用。只返回视图需要的 Signal 与方法，控制器和任务留在逻辑层。

## 表单绑定原生控件

```js
import { definePage } from '@reactive-mp/runtime';
import { useForm, useField } from '@reactive-mp/components/form';

definePage(() => {
  const form = useForm({ initialValues: { name: '' }, rules: { name: [{ required: true }] } });
  const name = useField({ name: 'name' }, { form, validateOn: 'blur' });
  return { name: name.value, error: name.errorMessage, onInput: name.onInput,
    onBlur: name.onBlur, submit: form.handleSubmit(async values => console.log(values)) };
});
```

```xml
<input value="{{name}}" bindinput="onInput" bindblur="onBlur" />
<text>{{error}}</text>
<button bindtap="submit">Submit</button>
```

页面 JSON 为空并在 app.json 登记。输入文本、离开输入框并提交即可校验。Hooks 不会替你渲染原生节点。

## Hook 入口

| Hook | 合同 |
| --- | --- |
| `useForm(props,options?)` | 模型、规则与提交控制器；values/state 为 Signal。 |
| `useFormItem(props)` | 在 Component setup 中提供命名字段作用域和反馈。 |
| `useField(props,{form?,scope?,validateOn?})` | 连接字段模型，返回 value、错误、原生事件处理器。 |
| `useChoice(props,options?)` | 布尔选择或单/多选组；多选用 options.multiple。 |
| `useSelect(props,{kind?,...options})` | kind 为 select、column、date、region，含草稿与确认逻辑。 |
| `useCascader(props,options?)` | 树形路径，返回层级、候选项及事件处理器。 |
| `useCalendar(props,options?)` | 月份、日期格、禁用日期与切月操作。 |
| `useUpload(props,{adapter?,...options})` | 文件列表 Signal、选择、任务控制与取消清理。 |
| `useFieldArray(form,path,{itemKey?})` | 动态数组行身份与 append/remove/move/replace。 |
| `useVideo(props,{group?,selector?,progressSelector?,emit?})` | 原生视频绑定；Page 直接绑定 video 时设置 group:false。 |
| `useVideoGroup()` | 祖先声音分组，返回 muteAll 与 memberCount。 |
| `useVideoParticipant(mute)` | 自定义内容参与最近声音分组。 |
| `useSwiper(props,{emit?})` | 索引、entries、renderOptions 与原生轮播事件处理器。 |
| `useMediaSwiper(props,options?)` | 混合媒体激活、静音与轮播事件。 |

## 控制器与生命周期

createFormController 独立管理模型与校验；registerField 返回需要解除注册的 lease，控制器需要 dispose。createPlaybackController 将播放意图与具名阻塞条件分开，attach 一个具有 play/pause 的目标，并在结束时 dispose。所有参数和返回值见[完整类型](api.md)。

Video 需要把原生事件绑定到返回的处理器，真实节点 id 与 selector 对应。自定义 Swiper 结构需要绑定 onChange、transition 和 animationfinish，renderOptions 用于布局接线，不解释业务内容。不需要定制接线时优先选择已有 wrappers。

作用域管理监听与任务，不复制原生关系标记实现，不在卸载后继续保留旧控制器。对照 [Form](form.md)、[Video](video.md)、[Swiper](swiper.md) 选择接线层。
