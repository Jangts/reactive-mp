# Reactive MP Components

包名为 `@reactive-mp/components`。

面向原生小程序的无头交互能力库。按 form、video、swiper 组织状态、控制器、组合 Hooks 和原生 wrappers，业务布局与视觉由项目管理。

## 按领域选择

| 领域 | 主要能力 | 文档 |
| --- | --- | --- |
| form | 模型、字段、校验与上传适配 | [表单](form.md) |
| video | 播放意图、可见性与声音分组 | [视频](video.md) |
| swiper | 索引、滑动与内容组合 | [轮播](swiper.md) |

可以从统一入口导入，也可以只使用领域子入口。逻辑导入不注册组件、不加载样式；原生 wrappers 是可选的接线实现，包含默认结构和基础样式。需要完全自定义视觉时，直接用 Hooks 驱动原生控件。

[快速上手](getting-started.md)说明安装与首个自定义页面；[组合指南](guide.md)说明状态、资源和视图的归属；[API 参考](api.md)覆盖统一入口及各领域。
