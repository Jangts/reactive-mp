# Preloader integration

Follow [Quick start](getting-started.md) to install Kit and prepare native sources. The component is at /vendor/kit/miniprogram/images-preloader/components/images-preloader/index. In source hosts, npm run examples:prepare prepares this path.

The complete page configuration, template and ordinary Page handler are shown below. Supply /assets/cover.jpg in your Mini Program:

```json
{
  "usingComponents": {
    "images-preloader": "/vendor/kit/miniprogram/images-preloader/components/images-preloader/index"
  }
}
```

```xml
<images-preloader id="preloader" />
<button bindtap="preload">预加载</button>
<text>{{report}}</text>
```

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

The component occupies no layout space and does not need dimensions. Do not disable active loading nodes with wx:if, hidden or display:none. The promise returns total, done and fail counters; complete per-image results are described in the guide.
