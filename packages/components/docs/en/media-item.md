# MediaItem

Adapt image/video items and forward video events with their event type.

## When to use

Use as the generic renderer for mixed media.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

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

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
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

```js [Reactive composition]
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

Interact with this MediaItem example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

item.type="video" selects the video adapter; other items render as images. active controls whether video may play. itemevent.type distinguishes soundon, mutedchange, playbacksummary and error.

### Read media events

Bind bind:itemevent="onItemEvent" on rmp-item and add this method to Page.

```js
onItemEvent(event) {
  const { type, detail } = event.detail;
  console.log(type, detail);
}
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| item | `object` | `null` | Item data; images use src/mode, videos also use type, poster and related fields |
| index | `number` | `0` | Zero-based index of this item |
| active | `boolean` | `false` | Whether this is the active media item; only an active video may play. |


## Events

| Event | event.detail |
| --- | --- |
| itemevent | {type,detail}; type identifies sound, playback summary or error events. |

## Slots and styling

This wrapper has no content slots. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

No additional imperative methods are documented for this wrapper.

## FAQ and boundaries

MediaItem is a content adapter and does not advance the index. Standalone use must synchronize active so offscreen videos do not retain playback intent.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
