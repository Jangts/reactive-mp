# Video 视频

围绕原生 video 协调播放意图、可见性、进度和声音。

## 何时使用

播放需要配合页面生命周期和可见性时使用。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

### index.json

```json
{
  "usingComponents": {
    "rmp-video": "/vendor/components/miniprogram/video/components/video/index"
  }
}
```

### index.wxml

```xml
<view style="height: 400rpx"><rmp-video id="video" src="{{src}}" controls="{{true}}" autoplay="{{false}}" /></view>
<button bindtap="play">Play</button>
```

### index.js

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

```js [原生配置式]
/** Video documentation demo: native Page event wiring. */
Page({
  data: {
    src: '/assets/demo.mp4',
  },
  play() {
    this.selectComponent('#video').play();
  },
});
```

```js [组合响应式]
/** Video documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';

definePage(() => {
  const page = useCurrentInstance();

  return {
    src: '/assets/demo.mp4',
    play: () => page.selectComponent('#video').play(),
  };
});
```

:::

运行后可直接操作此 Video 示例；请先把示例中 /assets 下的图片或视频放入工程；点击或滑动可观察组件交互。

## 常用场景

muted 默认 true，loop 默认 true。autoObserve 根据可见性阻塞播放，paused 是优先级更高的外部阻塞。play() 表达播放意图，不会绕过这些阻塞。

### 自定义播放按钮

替换基础 Video；controls="{{false}}" 关闭原生栏，自定义按钮仍走同一播放意图控制。

```xml
<rmp-video id="video" src="{{src}}" controls="{{false}}" show-custom-play-btn="{{true}}">
  <text slot="play">Play this video</text>
</rmp-video>
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| autoObserve | `boolean` | `true` | 是否按交叉可见性自动管理播放阻塞 |
| intersectionRatio | `number` | `0` | 判断视频可见的交叉比例阈值 |
| enableProgressTouch | `boolean` | `false` | 启用自定义进度条触摸 |
| src | `string` | `""` | 视频资源地址 |
| duration | `number` | `0` | 指定素材时长，单位秒；0 时等待原生元数据。 |
| controls | `boolean` | `false` | 显示原生控制栏 |
| danmuList | `array` | `[]` | 原生弹幕列表 |
| danmuBtn | `boolean` | `false` | 显示原生弹幕按钮 |
| enableDanmu | `boolean` | `false` | 启用原生弹幕 |
| autoplay | `boolean` | `false` | 是否自动切换或播放，仍受可见性和平台策略限制 |
| loop | `boolean` | `true` | 播放结束后是否循环 |
| paused | `boolean` | `false` | 外部暂停阻塞，优先于可见性自动播放 |
| muted | `boolean` | `true` | 外部同步静音状态 |
| hideSound | `boolean` | `false` | 隐藏自定义声音按钮 |
| showCustomPlayBtn | `boolean` | `false` | 显示自定义播放按钮 |
| showCustomProgress | `boolean` | `false` | 显示自定义进度条 |
| initialTime | `number` | `0` | 初始播放位置，秒 |
| pageGesture | `boolean` | `false` | 启用原生页面手势 |
| direction | `number` | `0` | 原生全屏方向 |
| showProgress | `boolean` | `false` | 显示原生进度条 |
| showFullscreenBtn | `boolean` | `false` | 显示原生全屏按钮 |
| showPlayBtn | `boolean` | `false` | 显示原生底部播放按钮 |
| showCenterPlayBtn | `boolean` | `false` | 显示原生居中播放按钮 |
| enableProgressGesture | `boolean` | `false` | 启用原生进度手势 |
| objectFit | `string` | `"cover"` | 视频画面填充方式 |
| poster | `string` | `""` | 视频封面地址 |
| stopFrame | `string` | `""` | 停止状态覆盖图地址 |
| showMuteBtn | `boolean` | `false` | 显示原生静音按钮 |
| title | `string` | `""` | 标题文字 |
| playBtnPosition | `string` | `"bottom"` | 原生播放按钮位置 |
| enablePlayGesture | `boolean` | `false` | 启用原生播放手势 |
| autoPauseIfNavigate | `boolean` | `true` | 跳转页面时自动暂停 |
| autoPauseIfOpenNative | `boolean` | `true` | 打开原生页面时自动暂停 |
| vslideGesture | `boolean` | `false` | 启用非全屏亮度和音量手势 |
| vslideGestureInFullscreen | `boolean` | `true` | 启用全屏亮度和音量手势 |
| customClass | `string` | `""` | 原生视频节点的附加类名 |
| customStyle | `string` | `""` | 原生视频节点的内联样式 |
| soundStyle | `string` | `""` | 自定义声音控件样式 |
| playStyle | `string` | `""` | 自定义播放控件样式 |
| fixedVisible | `boolean` | `false` | 外部固定可见状态 |
| canBePaused | `boolean` | `true` | 允许点击视频暂停 |
| replayCanBePaused | `boolean` | `true` | 允许重播阶段点击暂停 |


## 事件

| 事件 | event.detail |
| --- | --- |
| play | 对应原生 video 的 event.detail。 |
| pause | 对应原生 video 的 event.detail。 |
| ended | 对应原生 video 的 event.detail。 |
| waiting | 对应原生 video 的 event.detail。 |
| error | 对应原生 video 的 event.detail。 |
| loadedmetadata | 对应原生 video 的 event.detail。 |
| timeupdate | 对应原生 video 的 event.detail。 |
| fullscreenchange | 对应原生 video 的 event.detail。 |
| progress | 对应原生 video 的 event.detail。 |
| controlstoggle | 对应原生 video 的 event.detail。 |
| seekcomplete | 对应原生 video 的 event.detail。 |
| mutedchange | {muted:boolean}。 |
| soundon | 参与者开启声音。 |
| playbacksummary | {startTime,currentTime,duration,mediaDuration,reason,finished}。 |

## 插槽与样式

可用插槽：`muted`, `sound`, `play`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `play()` | 请求播放；可见性、外部 paused 等阻塞仍生效。 |
| `pause()` | 请求暂停，保留可恢复的播放状态。 |
| `stop()` | 停止播放并结束当前播放区间。 |
| `seek(seconds)` | 跳转到指定秒数，交给原生 video 上下文。 |
| `seekToPercent(percent)` | percent 为 0–1，按素材时长换算；不是 0–100。 |
| `mute()` | 静音当前视频；MediaSwiper 则静音全部媒体项。 |
| `setMuted(muted)` | 设置本视频静音状态，并触发相应声音协调。 |
| `playbackRate(rate)` | 设置原生播放倍速，平台支持范围由微信决定。 |
| `requestFullScreen(options?)` | 请求原生全屏；可传 direction。 |
| `exitFullScreen()` | 退出原生全屏。 |
| `sendDanmu(options)` | 发送弹幕，options 含 text、color。 |
| `showStatusBar()` | 调用原生上下文显示状态栏。 |
| `hideStatusBar()` | 调用原生上下文隐藏状态栏。 |

## 常见问题与边界

必须给外层容器确定高度，并提供可访问的视频资源。自动播放、全屏和声音受平台策略影响；playbacksummary.duration 是区间观看时长，mediaDuration 是素材时长。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
