# VideoGroup 视频声音分组

协调后代视频参与者的声音，不规定版式。

## 何时使用

用于不希望同时有声播放的一组视频。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-video-group": "/vendor/components/miniprogram/video/components/group/index",
    "rmp-video": "/vendor/components/miniprogram/video/components/video/index"
  }
}
```

### index.wxml

```xml
<rmp-video-group id="group">
  <view style="height: 320rpx"><rmp-video src="{{first}}" controls="{{true}}" /></view>
  <view style="height: 320rpx"><rmp-video src="{{second}}" controls="{{true}}" /></view>
</rmp-video-group>
<button bindtap="muteAll">Mute all</button>
```

### index.js

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

```js [原生配置式]
/** VideoGroup documentation demo: native Page event wiring. */
Page({
  data: {
    first: '/assets/first.mp4',
    second: '/assets/second.mp4',
  },
  muteAll() {
    this.selectComponent('#group').muteAll();
  },
});
```

```js [组合响应式]
/** VideoGroup documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';

definePage(() => {
  const page = useCurrentInstance();

  return {
    first: '/assets/first.mp4',
    second: '/assets/second.mp4',
    muteAll: () => page.selectComponent('#group').muteAll(),
  };
});
```

:::

运行后可直接操作此 VideoGroup 示例；请先把示例中 /assets 下的图片或视频放入工程；点击或滑动可观察组件交互。

## 常用场景

用同一组包住多段 Video。当某一参与者打开声音时，其余成员被静音。也可显式调用 muteAll()，不影响组外的视频。

### 保留一个参与者的声音

给组内两个视频各加 id，在 Page 事件中执行。

```js
const current = this.selectComponent('#first-video');
this.selectComponent('#group').muteAll(current);
```

## 属性

此 wrapper 不声明额外属性。


## 事件

此 wrapper 不额外声明自定义事件。

## 插槽与样式

可用插槽：`default`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `muteAll(except?)` | 静音组内其他参与者。 |

## 常见问题与边界

分组只协调声音，不自动组织布局，也不等于全局单例。自定义视频参与者可通过 useVideoParticipant 连接同一组。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
