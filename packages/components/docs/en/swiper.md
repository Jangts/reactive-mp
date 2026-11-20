# Swiper

Coordinate index, native transitions, stable item identity and optional carousel layouts.

## When to use

Use for images or custom generic item components.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-gallery": "/vendor/components/miniprogram/swiper/components/swiper/index"
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
/** Swiper documentation demo: native Page event wiring. */
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
        type: 'image',
        src: '/assets/second.jpg',
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
/** Swiper documentation demo: reactive composition page. */
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
        type: 'image',
        src: '/assets/second.jpg',
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

Interact with this Swiper example. Supply the images or videos referenced under /assets, then tap or swipe to observe the interaction.

## Usage patterns

layout="focus" or "coverflow" displays neighboring items; peek and gap adjust spacing. ImageItem is the default generic renderer; generic:item can supply an application component.

### Neighboring content and indicators

Replace the basic carousel and retain a definite parent height.

```xml
<rmp-gallery id="gallery" items="{{items}}" item-key="id" layout="focus" peek="32px" gap="12px" indicator="{{true}}" />
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
| transition | {dx,dy?}. |

## Slots and styling

Available slots: `overlay`, `footer`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `to(index)` | Move to the target index, normalizing out-of-range values. |
| `next()` | Move to the next item using circular/boundary rules. |
| `previous()` | Move to the previous item using circular/boundary rules. |
| `refresh()` | Measure the container again and refresh its layout. |

## FAQ and boundaries

The parent must define a height. itemKey preserves identity when items change. Fewer than two items disable looping and autoplay. to() normalizes the target index.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
