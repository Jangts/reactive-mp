# Reactive MP Components

面向原生微信小程序的无头交互能力库。复用行为、Hooks 与原生接线，项目决定结构、布局与视觉。普通 Page 可以直接使用 wrappers，响应式页面也可以只组合 Hooks。

## 按任务开始

| 任务 | 入口 |
| --- | --- |
| 收集和校验数据 | [Form](form.md)、[FormItem](form-item.md)、[FormButton](form-button.md) |
| 输入文字与选择状态 | [Input](input.md)、[Textarea](textarea.md)、[Checkbox](checkbox.md)、[Switch](switch.md) |
| 列表、滚轮与日期选择 | [Select](select.md)、[Cascader](cascader.md)、[Calendar](calendar.md) |
| 管理文件任务 | [Upload](upload.md) |
| 视频播放和声音协调 | [Video](video.md)、[VideoGroup](video-group.md) |
| 图片、卡片与混合媒体轮播 | [Swiper](swiper.md)、[MediaSwiper](media-swiper.md) |

[组件总览](catalog.md)列出全部组件；[快速上手](getting-started.md)从完整原生页面开始；[Hooks 与控制器](hooks.md)提供自定义结构的用法。

逻辑入口不注册组件、不启动平台操作或加载样式。可选 wrappers 带有默认结构和基础样式；需要完全自定义外观时，使用 Hooks 与原生节点。
