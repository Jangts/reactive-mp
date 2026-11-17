# 快速上手

运行时依赖 `@reactive-mp/runtime`、`@reactive-mp/reactivity`，通过包依赖安装。工作区源码接入运行 `npm run examples:prepare`；组件路径为 `/vendor/images-preloader/miniprogram/components/images-preloader/index`。

取得匹配版本的四个本地 tarball，在消费工程执行，然后在微信开发者工具构建 npm：

```sh
npm install ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-images-preloader-0.1.0.tgz
```

不假定包已发布到公共 registry。

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
