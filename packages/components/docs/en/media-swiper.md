# MediaSwiper

Compose Swiper with mixed media, active-item playback and sound coordination.

## When to use

Use for galleries containing both images and videos.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-gallery": "/vendor/components/miniprogram/swiper/components/media-swiper/index"
  }
}
```

### index.wxml

```xml
<view style="height: 400rpx"><rmp-gallery id="gallery" items="{{items}}" item-key="id" indicator="{{true}}" bind:change="onChange" /></view>
<button bindtap="next">Next</button><text>{{current}}</text>
```

### index.js

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
/** MediaSwiper documentation demo: native Page event wiring. */
Page({
  data: {
    items: [
      {
        id: 'a',
        type: 'image',
        src: '/assets/first.jpg',
      },
      {
        id: 'b',
        type: 'video',
        src: '/assets/demo.mp4',
        poster: '/assets/second.jpg',
      },
    ],
    current: 0,
  },
  onChange(event) {
    this.setData({ current: event.detail.current });
  },
  next() {
    this.selectComponent('#gallery').next();
  },
});
```

```js [Reactive composition]
/** MediaSwiper documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [current, setCurrent] = useSignal(0);
  const page = useCurrentInstance();

  return {
    items: [
      {
        id: 'a',
        type: 'image',
        src: '/assets/first.jpg',
      },
      {
        id: 'b',
        type: 'video',
        src: '/assets/demo.mp4',
        poster: '/assets/second.jpg',
      },
    ],
    current,
    onChange: (event) => setCurrent(event.detail.current),
    next: () => page.selectComponent('#gallery').next(),
  };
});
```

:::

Interact with this MediaSwiper example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

items may mix {type:"image",src} and {type:"video",src,poster,muted}. Only the active video participates in playback. mute() mutes media in this carousel.

### Mute and advance

Run this from a Page button handler; videos outside this carousel are unaffected.

```js
const gallery = this.selectComponent('#gallery');
gallery.mute();
gallery.next();
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| items | `array` | `[]` | Array of content items |
| itemKey | `string` | `"id"` | Stable identity key; duplicate identities fall back to indices |
| current | `number` | `0` | Controlled zero-based index |
| circular | `boolean` | `false` | Looping; automatically disabled with fewer than two items |
| autoplay | `boolean` | `false` | Automatic switching or playback, subject to visibility and platform policies |
| interval | `number` | `5000` | Automatic switching interval in milliseconds |
| duration | `number` | `300` | Slide animation duration in milliseconds. |
| disableTouch | `boolean` | `false` | Disable touch-driven slide changes |
| layout | `string` | `"plain"` | plain, focus or coverflow |
| peek | `string` | `""` | Visible neighbor margin; an explicit value overrides the layout default |
| gap | `string` | `"0px"` | Gap between items, including a CSS unit |
| indicator | `boolean` | `false` | Show built-in indicators when there are multiple items |


## Events

| Event | event.detail |
| --- | --- |
| change | {current,source}. |
| animationfinish | {current,source?,...native detail}. |
| transitionstart | {dx,dy?}. |
| itemclick | {index,active,item}. |
| itemevent | {index,item,detail}. |

## Slots and styling

Available slots: `footer`, `overlay`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `to(index)` | Move to the target index, normalizing out-of-range values. |
| `next()` | Move to the next item using circular/boundary rules. |
| `previous()` | Move to the previous item using circular/boundary rules. |
| `refresh()` | Measure the container again and refresh its layout. |
| `mute()` | Mute this video, or all items when called on MediaSwiper. |

## FAQ and boundaries

Composition handles item activation and sound coordination. Use event details for analytics rather than assuming playback succeeded. Layout properties match Swiper.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
