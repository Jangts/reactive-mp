# Video

Coordinate playback intent, visibility, progress and sound around native video.

## When to use

Use when playback must cooperate with lifecycle and visibility.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

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

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
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

```js [Reactive composition]
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

Interact with this Video example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

muted and loop both default to true. autoObserve blocks playback based on visibility; paused is a higher-priority external blocker. play() expresses intent without bypassing blockers.

### Custom play control

Replace the basic Video. controls="{{false}}" hides the native bar; the custom button still follows the same playback intent.

```xml
<rmp-video id="video" src="{{src}}" controls="{{false}}" show-custom-play-btn="{{true}}">
  <text slot="play">Play this video</text>
</rmp-video>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| autoObserve | `boolean` | `true` | Use intersection visibility to manage playback blocking |
| intersectionRatio | `number` | `0` | Intersection ratio threshold for visibility |
| enableProgressTouch | `boolean` | `false` | Enable touch interaction on the custom progress bar |
| src | `string` | `""` | Video resource URL |
| duration | `number` | `0` | Specified media duration in seconds; 0 waits for native metadata. |
| controls | `boolean` | `false` | Show native controls |
| danmuList | `array` | `[]` | Native danmu list |
| danmuBtn | `boolean` | `false` | Show the native danmu button |
| enableDanmu | `boolean` | `false` | Enable native danmu |
| autoplay | `boolean` | `false` | Automatic switching or playback, subject to visibility and platform policies |
| loop | `boolean` | `true` | Loop after playback ends |
| paused | `boolean` | `false` | External pause blocker, taking priority over visibility-driven playback |
| muted | `boolean` | `true` | Externally synchronized muted state |
| hideSound | `boolean` | `false` | Hide the custom sound control |
| showCustomPlayBtn | `boolean` | `false` | Show the custom play control |
| showCustomProgress | `boolean` | `false` | Show the custom progress control |
| initialTime | `number` | `0` | Initial playback position in seconds |
| pageGesture | `boolean` | `false` | Enable native page gestures |
| direction | `number` | `0` | Native fullscreen orientation |
| showProgress | `boolean` | `false` | Show native progress |
| showFullscreenBtn | `boolean` | `false` | Show the native fullscreen button |
| showPlayBtn | `boolean` | `false` | Show the native bottom play button |
| showCenterPlayBtn | `boolean` | `false` | Show the native center play button |
| enableProgressGesture | `boolean` | `false` | Enable native progress gestures |
| objectFit | `string` | `"cover"` | Video content fitting mode |
| poster | `string` | `""` | Video poster URL |
| stopFrame | `string` | `""` | Image displayed over a stopped video |
| showMuteBtn | `boolean` | `false` | Show the native mute button |
| title | `string` | `""` | Title text |
| playBtnPosition | `string` | `"bottom"` | Native play button position |
| enablePlayGesture | `boolean` | `false` | Enable native playback gestures |
| autoPauseIfNavigate | `boolean` | `true` | Pause automatically when navigating away |
| autoPauseIfOpenNative | `boolean` | `true` | Pause automatically when opening a native page |
| vslideGesture | `boolean` | `false` | Enable brightness/volume gestures outside fullscreen |
| vslideGestureInFullscreen | `boolean` | `true` | Enable brightness/volume gestures in fullscreen |
| customClass | `string` | `""` | Additional class name for the native video node |
| customStyle | `string` | `""` | Inline style for the native video node |
| soundStyle | `string` | `""` | Style for the custom sound control |
| playStyle | `string` | `""` | Style for the custom play control |
| fixedVisible | `boolean` | `false` | Externally fixed visibility state |
| canBePaused | `boolean` | `true` | Allow tap-to-pause |
| replayCanBePaused | `boolean` | `true` | Allow tap-to-pause during replay |


## Events

| Event | event.detail |
| --- | --- |
| play | The matching native video event.detail. |
| pause | The matching native video event.detail. |
| ended | The matching native video event.detail. |
| waiting | The matching native video event.detail. |
| error | The matching native video event.detail. |
| loadedmetadata | The matching native video event.detail. |
| timeupdate | The matching native video event.detail. |
| fullscreenchange | The matching native video event.detail. |
| progress | The matching native video event.detail. |
| controlstoggle | The matching native video event.detail. |
| seekcomplete | The matching native video event.detail. |
| mutedchange | {muted:boolean}. |
| soundon | The participant activates sound. |
| playbacksummary | {startTime,currentTime,duration,mediaDuration,reason,finished}. |

## Slots and styling

Available slots: `muted`, `sound`, `play`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `play()` | Request playback while preserving visibility and external pause blockers. |
| `pause()` | Request a pause while retaining resumable playback state. |
| `stop()` | Stop playback and end the current playback interval. |
| `seek(seconds)` | Seek to the specified position in seconds through the native video context. |
| `seekToPercent(percent)` | percent is 0–1 and is converted using media duration; it is not 0–100. |
| `mute()` | Mute this video, or all items when called on MediaSwiper. |
| `setMuted(muted)` | Set this video muted state and run sound coordination. |
| `playbackRate(rate)` | Set native playback speed within WeChat platform limits. |
| `requestFullScreen(options?)` | Request native fullscreen with optional direction. |
| `exitFullScreen()` | Exit native fullscreen. |
| `sendDanmu(options)` | Send danmu with text and optional color. |
| `showStatusBar()` | Ask the native context to show its status bar. |
| `hideStatusBar()` | Ask the native context to hide its status bar. |

## FAQ and boundaries

Give the outer container a definite height and supply an accessible video. Platform policies govern autoplay, fullscreen and sound. playbacksummary.duration is interval watch time; mediaDuration is the asset duration.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
