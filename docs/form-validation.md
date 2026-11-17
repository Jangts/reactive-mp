# 表单套件验证记录

## 实现范围

`@reactive-mp/components/form` 提供 Form、FormItem、FormButton 和 13 个字段组件，按 components、hooks、utils 组织。9 个 Hooks 复用模型、规则、选择和文件任务逻辑。普通组件的原生关系使用共享 Behavior 标记，页面直接使用 Hooks 时显式连接 form。

字段覆盖 Input、Textarea、Checkbox、Switch、RadioGroup、CheckboxGroup、Select、ColumnPicker、DatePicker、RegionPicker、Cascader、Calendar 和 Upload。组件和业务请求之间通过校验函数注册表、上传 adapter 和中性事件连接。

## 自动化检查

2026-11-18 的执行结果：

| 检查 | 结果 | 证据范围 |
| --- | --- | --- |
| 表单专项 | 20 项通过 | 路径、规则、异步隔离、生命周期、关系接线、属性别名、选择、日历、上传和数组行 |
| 全库 Node 回归 | 113 项通过 | 当前工作区各包的自动化合同 |
| 公开类型 | 通过 | 普通控制器、异步 validator、各类 Hooks、上传 adapter 和错误返回类型 |
| 源码结构与排版 | 通过 | 模块职责说明、语法、显式控制流与格式 |
| 离线包体 | 10 个包通过 | 从真实 tarball 安装到隔离消费者；Form 的 16 个组件配套文件和准备后的导入入口 |
| 微信 WXML 编译器 | 22 个文件通过 | 包内组件、示例页面和自定义复合字段的模板 |
| 微信 WXSS 编译器 | 23 个文件通过 | 组件共享样式、组件入口和示例样式 |
| 文档 | 通过 | API 来源、链接、导航和文档站构建 |

回归重点包括：约束不会被自定义 validator 替代；未匹配 trigger 不清除已有错误；异步校验在改值、reset、卸载和 dispose 后及时结束且不回写；外部错误不会被 submit 抹掉；上传按选择顺序提交且取消后不恢复；多选草稿不被其他字段更新关闭；数组重排移动字段身份及错误，reset 恢复初始数组。

运行命令：

```sh
npm run examples:prepare
node --test tests/*.test.mjs
npm run typecheck
npm run code:check
npm run format:check
npm run packages:check
npm run docs:check
npm run docs:build
```

本机微信编译结果保存于 `artifacts/form-compile-verification.json`。编译器检查不证明键盘、原生关系链接顺序、滚动或设备媒体操作正确。

## 平台验收边界

### 组件包合并后的检查

2026-11-18，form、video、swiper 合并为 `@reactive-mp/components` 的内部领域；上表中的 10 个包记录对应合并前的交付结构。合并后 116 项 Node 回归、工作区类型和隔离消费者类型检查通过，8 个实际 tarball 在工作区外离线安装通过。检查同时覆盖统一入口与领域入口共享实现、原生 wrappers 配套文件、媒体轮播到视频的包内路径、独立组件依赖闭包与旧生成目录迁移。

组件库和领域文档已纳入导航，文档检查与 28 页构建通过。此次调整没有改变组件模板、样式或交互逻辑，也未重新执行微信开发者工具与真机验收。

`npm run verify:form` 尝试普通 Page、Reactive Page、Hooks 加原生控件、自定义字段及多表单隔离。自动化连接读到了基础库 3.8.10，但页面组件查询等待响应超时，当前没有完成这些交互场景。当前失败回执为 `artifacts/form-live-verification.json`，不能将连接成功或模板编译成功作为页面验收通过。

integration 首页的 Form 示例可独立检查四类用法。实际输入、校验、错误反馈、弹窗确认与取消、自定义字段归属、重复行、选文件和视频预览仍需要在开发者工具及真机中完成交互验收。微信 npm 构建也与离线源码准备检查分开记录。

## 接口设计与实现约定

正式使用入口为[包 README](../packages/components/docs/form.md)，初始边界讨论保存在[设计稿](form-design.md)。实现采用以下明确约定：

- 组件关系使用 scope=true；直接在 Page 使用 Hooks 不声明组件专属关系。
- 单文件与多文件共用 FileValue 数组；视频预览由 preview 事件交给调用方。
- FieldArray 的 move/remove 对齐当前字段状态，reset 恢复初始模型；整表替换缺少 itemKey 时重建行身份。
- 折叠按钮组通过实际渲染的选项数量控制展开，不依赖一次测量后缓存的固定高度。
- 自定义文本插槽与对应文字属性可以同时存在；替换默认文字时清空文字属性。
