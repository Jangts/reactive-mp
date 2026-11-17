# @reactive-mp/images-preloader

原生微信小程序图片预加载组件与响应式 Hook。使用隐藏的原生 image 节点等待加载结果，支持批次统计、共享请求、超时、卸载清理和已加载尺寸查询。普通 Page 和 Reactive 页面使用同一个组件。

## 接入

运行时依赖 `@reactive-mp/runtime`、`@reactive-mp/reactivity`，通过包依赖安装。工作区源码接入运行 `npm run examples:prepare`；组件路径为 `/vendor/images-preloader/miniprogram/components/images-preloader/index`。

本地包体接入：在已安装两个运行时依赖的工程中执行 `npm install /path/to/reactive-mp-images-preloader-0.1.0.tgz`，然后在微信开发者工具构建 npm。不假定包已发布到公共 registry。

页面 JSON 注册：

```json
{
  "usingComponents": {
    "images-preloader": "@reactive-mp/images-preloader/components/images-preloader/index"
  }
}
```

页面 WXML：

```xml
<images-preloader id="preloader" />
<button bindtap="preload">预加载</button>
<text>{{report}}</text>
```

普通页面 JS（将 `/assets/cover.jpg` 放入自己的小程序工程）：

```js
Page({
  data: { report: '' },
  async preload() {
    const { total, done, fail } = await this.selectComponent('#preloader')
      .loadImages(['/assets/cover.jpg'], { timeout: 5000 });
    this.setData({ report: `共 ${total}，成功 ${done}，失败 ${fail}` });
  },
});
```

组件自身不占用页面排版空间，不需要设置宽高。不要由外部使用 `wx:if`、`hidden` 或 `display: none` 关闭仍在使用的加载节点。

## 文档

[概览](./docs/index.md) · [快速上手](./docs/getting-started.md) · [使用指南](./docs/guide.md) · [API 参考](./docs/api.md)
