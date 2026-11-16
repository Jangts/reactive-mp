# @reactive-mp/video

微信小程序视频组件，提供播放控制、媒体展示、播放事件和基于组件树的多视频声音协调。可独立使用。

## 接入

安装 `@reactive-mp/video` 后在微信开发者工具构建 npm，在页面 JSON 注册：

```json
{
  "usingComponents": {
    "mp-video": "@reactive-mp/video/video/index",
    "video-group": "@reactive-mp/video/group/index"
  }
}
```

```xml
<video-group>
  <view style="height: 400rpx">
    <mp-video src="{{firstUrl}}" poster="{{firstCover}}" autoplay show-custom-play-btn />
  </view>
  <view style="height: 400rpx">
    <mp-video src="{{secondUrl}}" show-custom-play-btn show-custom-progress enable-progress-touch />
  </view>
</video-group>
```

组件宽高填满容器，容器需提供高度。wrapper 只有 slot，没有额外布局。默认静音、循环、观察可见性；自动播放默认关闭。`intersection-ratio` 默认 0，可设 0.5；可见比例必须超过阈值才允许播放。

仓库源码开发也可运行 `npm run examples:prepare`，原生宿主通过 `/vendor/video/miniprogram/video/index` 和 `/vendor/video/miniprogram/group/index` 注册，不需要构建 npm。npm 构建及真机行为仍需微信开发者工具验证。

## 播放控制

`selectComponent()` 后可调用 `play()`、`pause()`、`stop()`、`seek(seconds)`、`playbackRate(rate)`、全屏与弹幕方法。

播放意图与播放条件独立：`autoplay` 初始化意图；显式 play/pause 或原生播放控件修改意图。`paused`、离屏和页面隐藏只暂时阻止播放；条件恢复后仅恢复仍有播放意图的视频。用户主动暂停不会因滚动恢复而播放。`auto-observe="{{false}}"` 或 `fixed-visible` 跳过可见性限制，仍遵守外部暂停和页面隐藏。`paused` 从 true 改为 false 本身不创建播放意图。

组内视频可以同时静音播放；开启一个成员的声音会将其他成员静音。wrapper 控制范围由组件树限定，可以包住整个页面内容，不维护跨页面应用级注册表。外部调用 wrapper 的 `muteAll()` 可静音全部成员。嵌套 wrapper 各管自己的成员。

## 展示与事件

支持的原生视频属性和展示选项见 [properties.js](./miniprogram/video/properties.js)。

- `poster` 为播放前封面，`stop-frame` 为非循环播放结束后的展示图。
- `show-custom-play-btn`、`show-custom-progress`、`enable-progress-touch` 控制自定义控件。
- `hide-sound` 隐藏声音按钮；`play-style`、`sound-style` 调整位置；`play`、`sound`、`muted` 命名插槽替换按钮内容。`--video-control-inset`、`--video-control-padding`、`--video-control-color`、`--video-control-font-size`、`--video-progress-height` 提供通用样式默认值的覆盖入口。
- 原生事件转发：play、pause、ended、timeupdate、loadedmetadata、fullscreenchange、waiting、error、progress、controlstoggle、seekcomplete。
- 用户点击声音按钮触发 `mutedchange`，detail 为 `{ muted }`，开启声音另外触发 `soundon`。程序通过 `muted` 或 `setMuted()` 控制；wrapper 使用 `mute()` 静音。

组件额外发出 `playbacksummary`，用于旁听一次播放区间的结果，不调用统计 SDK，也不附加业务信息：

```xml
<mp-video src="{{url}}" bind:playbacksummary="onPlaybackSummary" />
```

事件 detail：`startTime`、`currentTime` 是媒体位置；`duration` 是区间内经过的播放时间；`mediaDuration` 是视频总时长，单位均为秒。`reason` 为 pause、ended、stop、sourcechange、detach 或 error；`finished` 仅在收到原生 ended 时为 true，不表示用户完整看过所有内容。

区间从原生 play 开始，在上述结束条件首次发生时只发出一次汇总；恢复播放开启新区间。收到 waiting 时暂停计时，后续 play/timeupdate 恢复计时。该时长依赖原生事件到达时间，属于近似值，不代表解码帧时长或去重观看覆盖率；跳转进度与倍速不会直接增加计时。未播放不发汇总。卸载时会尝试发出汇总，页面销毁阶段的外部监听交付需在平台验收。

业务侧可以自行给事件结果附加上下文或用于统计。

## 组合组件参与协议

单个视频已自动参与分组。自定义媒体组合若要作为一个整体参与，可复用 `getVideoParticipantBehavior()`（包的 `participant` 子路径），并声明指向 wrapper 的 ancestor relation，在 linked/unlinked 中设置和清理实例字段 `_videoGroup`。该协议依赖小程序 Behavior，必须在小程序环境调用，不能在 Node 初始化时调用。

组合组件应实现 `mute()`，使内部媒体静音；开启声音时调用 `this._videoGroup?.muteAll(this)`。注册表以实例身份标识成员，卸载时删除，不把实例和上下文写入 setData。

## 验证边界

Node 测试覆盖播放门控、暂停恢复、分组注册清理和组件绑定。实际视频解码、原生控件、组件关系及 npm 构建效果需要开发者工具与真机验证。
