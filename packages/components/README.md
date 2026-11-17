<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/reactive-mp-components-logo-light.svg"><img src="docs/assets/reactive-mp-components-logo.svg" alt="Reactive MP Components" width="522"></picture></p>

# Reactive MP Components

npm 包：`@reactive-mp/components`。

面向原生微信小程序的无头组件能力库。按 form、video、swiper 组织交互状态、控制器、组合 Hooks 和原生 wrappers，应用自行组合页面结构与视觉。

逻辑入口不注册组件、不启动平台操作，也不加载样式。组件目录提供可选的原生 wrappers，包含默认结构与基础样式；需要完全自定义外观时，可直接使用 Hooks 和原生控件。

## 安装包体

需要微信原生小程序宿主。取得同一次交付的匹配版本 tarball，在小程序 npm 工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
```

源码仓库根目录可执行 `npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts` 生成包体，先创建目标目录。这里说明本地交付方式，不假定包已发布到公共 registry。form、video、swiper 是本包内部领域，不需要分别安装。

## Hooks 与自定义结构

在使用 Reactive MP 注册 API 的工程中，可从统一入口或领域入口导入：

```js
// pages/gallery/index.js
import { definePage } from '@reactive-mp/runtime';
import { useSwiper } from '@reactive-mp/components/swiper';

definePage(() => useSwiper({ items: ['第一项', '第二项'], circular: true }));
```

页面模板由项目提供，例如：

```xml
<text>当前索引：{{current}}</text>
<button bindtap="previous">上一项</button>
<button bindtap="next">下一项</button>
```

初始索引为 0，点击按钮切换索引。统一入口 `@reactive-mp/components` 也导出 useSwiper、useForm、useVideo 等相同函数，不引入另一份状态或运行时。原生工程使用微信 npm 构建或 Reactive MP 源码准备工具解析包路径；工作区运行 `npm run examples:prepare` 后，宿主从 `vendor/components/miniprogram/swiper/index.js` 导入对应逻辑。

## 可选原生 wrappers

微信开发者工具构建 npm 后，在页面 JSON 中登记所需组件，例如：

```json
{
  "usingComponents": {
    "rmp-video": "@reactive-mp/components/video/components/video/index"
  }
}
```

```xml
<view style="height: 400rpx">
  <rmp-video src="{{videoUrl}}" controls />
</view>
```

页面 data 中提供可访问的 videoUrl 后，显示原生视频。wrapper 的事件、属性和资源清理沿用对应领域的合同，不要求使用统一主题。实际视频播放、原生关系和微信 npm 构建效果需要开发者工具与真机验证。

## 领域入口

| 入口 | 能力与说明 |
| --- | --- |
| `@reactive-mp/components/form` | [表单](docs/form.md)：模型、校验、字段与上传适配器 |
| `@reactive-mp/components/video` | [视频](docs/video.md)：播放状态、可见性与声音分组 |
| `@reactive-mp/components/swiper` | [轮播](docs/swiper.md)：索引、滑动与内容组合 |

行为、状态和平台接线按领域复用；业务请求、项目布局、品牌颜色与主题由应用管理。Wechat 和 Images Preloader 由 @reactive-mp/kit 提供；Store 保留独立包，也可从 kit/store 使用同一实现。

[统一类型](index.d.ts) · [逻辑入口](miniprogram/index.js)。

## 文档

[在线文档](https://reactive-mp-components-docs.pages.jangts.cafe/)

[概览](./docs/index.md) · [快速上手](./docs/getting-started.md) · [使用指南](./docs/guide.md) · [API 参考](./docs/api.md)
