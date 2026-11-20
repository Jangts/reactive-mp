# ImageItem 图片内容项

为 Swiper 渲染图片内容，不控制轮播版式。

## 何时使用

用于默认泛型内容渲染，也可在明确尺寸的容器内单独使用。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-item": "/vendor/components/miniprogram/swiper/components/image-item/index"
  }
}
```

### index.wxml

```xml
<view style="height: 400rpx"><rmp-item item="{{item}}" index="{{0}}" active="{{true}}" /></view>
```

### index.js

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

```js [原生配置式]
/** ImageItem documentation demo: native Page event wiring. */
Page({
  data: {
    item: {
      type: 'image',
      src: '/assets/first.jpg',
      mode: 'aspectFill',
    },
  },
});
```

```js [组合响应式]
/** ImageItem documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';

definePage(() => {
  return {
    item: {
      type: 'image',
      src: '/assets/first.jpg',
      mode: 'aspectFill',
    },
  };
});
```

:::

运行后可直接操作此 ImageItem 示例；请先把示例中 /assets 下的图片或视频放入工程；点击或滑动可观察组件交互。

## 常用场景

item.src 提供图片路径，item.mode 默认 aspectFill。Swiper 自动传入 item、index、active；应用只需要提供 items 数组。

### 改变图片填充方式

在 Page 方法中更新 item；item 与 active 由 Swiper 使用时自动传入。

```js
this.setData({ item: { src: '/assets/first.jpg', mode: 'aspectFit' } });
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| item | `object` | `null` | 内容数据；图片含 src、mode，视频另含 type、poster 等 |
| index | `number` | `0` | 当前内容项的零基索引 |
| active | `boolean` | `false` | 接收激活标志；默认图片模板不据此改变渲染。 |


## 事件

此 wrapper 不额外声明自定义事件。

## 插槽与样式

此 wrapper 不提供内容插槽。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

此 wrapper 不额外约定命令式实例方法。

## 常见问题与边界

ImageItem 不管理 current、循环或声音。自定义 item 必须接受同样的三项属性，尺寸由轮播容器和项目布局决定。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
