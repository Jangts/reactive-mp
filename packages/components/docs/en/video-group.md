# VideoGroup

Coordinate audible playback among descendant video participants without imposing a layout.

## When to use

Use around related videos that should not play sound together.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

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

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
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

```js [Reactive composition]
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

Interact with this VideoGroup example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

Wrap related Videos in one group. When a participant activates sound, other members are muted. Call muteAll() explicitly without affecting videos outside the group.

### Keep one participant audible

Give the two child videos IDs and run this in a Page handler.

```js
const current = this.selectComponent('#first-video');
this.selectComponent('#group').muteAll(current);
```

## Properties

This wrapper declares no additional properties.


## Events

No additional custom events are declared by this wrapper.

## Slots and styling

Available slots: `default`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `muteAll(except?)` | Mute other participants in this group. |

## FAQ and boundaries

A group coordinates sound rather than layout and is not a global singleton. Custom video participants can join with useVideoParticipant.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
