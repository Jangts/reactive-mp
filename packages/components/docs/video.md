# @reactive-mp/components/video

微信小程序视频组件，提供播放控制、媒体展示、播放事件和基于组件树的多视频声音协调。内部使用 Reactive MP 管理响应式状态和生命周期，可直接在普通页面中使用。运行时依赖由 npm 安装：`@reactive-mp/runtime`、`@reactive-mp/reactivity`。

## 接入

按[统一组件包接入](../README.md)安装 `@reactive-mp/components` 后，在微信开发者工具构建 npm，在页面 JSON 注册：

```json
{
  "usingComponents": {
    "mp-video": "@reactive-mp/components/video/components/video/index",
    "video-group": "@reactive-mp/components/video/components/group/index"
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

仓库源码开发也可运行 `npm run examples:prepare`，原生宿主通过 `/vendor/components/miniprogram/video/components/video/index` 和 `/vendor/components/miniprogram/video/components/group/index` 注册，不需要构建 npm。npm 构建及真机行为仍需微信开发者工具验证。

## 播放控制

`selectComponent()` 后可调用 `play()`、`pause()`、`stop()`、`seek(seconds)`、`playbackRate(rate)`、全屏与弹幕方法。

播放意图与播放条件独立：`autoplay` 初始化意图；显式 play/pause 或原生播放控件修改意图。`paused`、离屏和页面隐藏只暂时阻止播放；条件恢复后仅恢复仍有播放意图的视频。用户主动暂停不会因滚动恢复而播放。`auto-observe="{{false}}"` 或 `fixed-visible` 跳过可见性限制，仍遵守外部暂停和页面隐藏。`paused` 从 true 改为 false 本身不创建播放意图。

收到原生 error 后会清除播放状态和意图，调用 play() 可显式重试。

组内视频可以同时静音播放；开启一个成员的声音会将其他成员静音。wrapper 控制范围由组件树限定，可以包住整个页面内容，不维护跨页面应用级注册表。外部调用 wrapper 的 `muteAll()` 可静音全部成员。嵌套 wrapper 各管自己的成员。

## 展示与事件

支持的原生视频属性和展示选项见 [properties.js](../miniprogram/video/utils/properties.js)。

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

## Reactive 组件使用 Hooks

包入口提供 `useVideo`、`useVideoGroup` 和 `useVideoParticipant`。在响应式 setup 中调用，生命周期和清理由 Hook 管理。

`useVideo(props, options)` 接受响应式属性对象或带 getter 的配置；普通对象适用于固定配置。返回 `state`、用于 WXML 的同名 Signal、控制方法和原生事件处理函数。`state` 用于组合计算，返回的 Signal 用于模板绑定。

```js
import { defineComponent } from '@reactive-mp/runtime';
import { computed } from '@reactive-mp/reactivity';
import { useVideo } from '@reactive-mp/components/video';

defineComponent(({ defineProps }) => {
  const props = defineProps({
    src: String,
    paused: Boolean,
    autoplay: { type: Boolean, value: true },
  });
  const video = useVideo(props, { selector: '#player' });
  return {
    ...video,
    status: computed(() => video.state.isPlaying ? '播放中' : '已暂停'),
  };
});
```

```xml
<video id="player" src="{{src}}" muted="{{soundOff}}" autoplay="{{false}}"
  controls
  bindplay="onPlay" bindpause="onPause" bindended="onEnded"
  bindwaiting="onWaiting" binderror="onError"
  bindloadedmetadata="onLoadedMetadata" bindtimeupdate="onTimeUpdate" />
<text>{{status}}</text>
```

在 `definePage` 中直接管理页面原生 video 时，设置 `group: false`，并通过 `emit` 监听事件。页面不参与组件祖先分组；普通组件和 Reactive 组件默认参与分组。`group` 是 setup 的固定配置，不能在实例运行时切换。

```js
const video = useVideo(props, {
  selector: '#player',
  group: false,
  emit(name, detail) { /* 处理播放事件 */ },
});
```

`selector` 指向当前页面或组件内的原生 video，默认 `#c-video`。Hook 使用该节点获取上下文并观察可见性。自定义进度条可通过 `progressSelector` 指定节点，默认 `.progress-container`。原生视频事件需要在模板中绑定到对应处理函数；`autoplay` 由 Hook 协调，原生节点设为 false。

Hook 默认通过宿主组件发出事件；Page 通过 emit 回调接收通知。可用 `options.emit(name, detail)` 接管事件通知。`playbacksummary` 等事件结构与视频组件一致。每个组件实例创建自己的播放器状态及资源，不在 setup 中直接访问原生视图。

`useVideoGroup()` 返回 `memberCount` Signal 和 `muteAll(except?)`。构建自定义 wrapper：

```js
import { defineComponent } from '@reactive-mp/runtime';
import { useVideoGroup } from '@reactive-mp/components/video';

defineComponent(() => useVideoGroup());
```

wrapper 模板使用 `<slot />`，JSON 声明 `"component": true`。普通视频组件与调用 `useVideo` 的组件均可加入这个范围。

`useVideoParticipant(mute)` 供媒体组合组件参与声音互斥。将返回的 `mute` 暴露为组件方法，开启声音时调用 `activateSound()`：

```js
import { defineComponent } from '@reactive-mp/runtime';
import { useSignal } from '@reactive-mp/reactivity';
import { useVideoParticipant } from '@reactive-mp/components/video';

defineComponent(() => {
  const [muted, setMuted] = useSignal(true);
  const participant = useVideoParticipant(() => setMuted(true));
  return {
    muted,
    ...participant,
    unmute() {
      setMuted(false);
      participant.activateSound();
    },
  };
});
```

Hook 通过共享 Behavior 标记建立原生组件关系，并自动释放成员引用。普通组件与 Reactive 组件使用同一套分组协议。

## 验证边界

Node 测试覆盖播放门控、暂停恢复、普通组件使用、响应式属性更新、多实例隔离、分组注册清理和播放事件。实际视频解码、原生控件、组件关系及 npm 构建效果需要开发者工具与真机验证。

## 目录

```text
miniprogram/video/
  components/
    video/              视频组件入口、模板与样式
    group/              分组容器入口与模板
  hooks/
    use-video.js        视频响应式状态与生命周期
    use-video-group.js  分组与参与者 Hooks
  utils/
    controller.js       播放意图与条件协调
    playback-session.js 播放区间汇总
    participant.js      原生关系标记
    properties.js       视频属性定义
  index.js              包级导出
```
