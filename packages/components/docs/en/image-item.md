# ImageItem

Render an image item for Swiper without controlling the carousel layout.

## When to use

Use as the default generic item renderer or on its own inside a sized container.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

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

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
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

```js [Reactive composition]
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

Interact with this ImageItem example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

item.src supplies the image path, and item.mode defaults to aspectFill. Swiper supplies item, index and active; applications usually only provide the items array.

### Change image fitting

Update item in a Page method. Swiper normally supplies item and active itself.

```js
this.setData({ item: { src: '/assets/first.jpg', mode: 'aspectFit' } });
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| item | `object` | `null` | Item data; images use src/mode, videos also use type, poster and related fields |
| index | `number` | `0` | Zero-based index of this item |
| active | `boolean` | `false` | Receives the active flag; the default image template does not vary its rendering with it. |


## Events

No additional custom events are declared by this wrapper.

## Slots and styling

This wrapper has no content slots. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

No additional imperative methods are documented for this wrapper.

## FAQ and boundaries

ImageItem does not manage current index, looping or sound. A custom item must accept the same three properties; carousel and application layout determine dimensions.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
