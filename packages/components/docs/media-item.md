# MediaItem 媒体内容项

适配图片和视频内容，并携带事件类型转发视频事件。

## 何时使用

用于图片和视频混排的泛型内容渲染。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-item": "/vendor/components/miniprogram/swiper/components/media-item/index"
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
/** MediaItem documentation demo: native Page event wiring. */
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
/** MediaItem documentation demo: reactive composition page. */
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

运行后可直接操作此 MediaItem 示例；请先把示例中 /assets 下的图片或视频放入工程；点击或滑动可观察组件交互。

## 常用场景

item.type="video" 时使用视频适配，否则显示图片。active 控制视频是否可以播放；itemevent 的 type 区分 soundon、mutedchange、playbacksummary 和 error。

### 转发媒体事件

在 rmp-item 上绑定 bind:itemevent="onItemEvent"，并将下面方法加到 Page。

```js
onItemEvent(event) {
  const { type, detail } = event.detail;
  console.log(type, detail);
}
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| item | `object` | `null` | 内容数据；图片含 src、mode，视频另含 type、poster 等 |
| index | `number` | `0` | 当前内容项的零基索引 |
| active | `boolean` | `false` | 是否为当前媒体项；只有激活项的视频允许播放。 |


## 事件

| 事件 | event.detail |
| --- | --- |
| itemevent | {type,detail}；type 为声音、播放区间或错误事件。 |

## 插槽与样式

此 wrapper 不提供内容插槽。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

此 wrapper 不额外约定命令式实例方法。

## 常见问题与边界

MediaItem 是内容适配器，不负责索引推进。独立使用时应用必须同步 active，避免离屏视频继续保留播放意图。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
