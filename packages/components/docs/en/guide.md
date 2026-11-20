# Headless composition and customization

## Choose a wiring layer

Controllers own interaction intent and pure state. Hooks connect reactive state to host lifecycle. Shared behaviors carry native relation identities. Optional wrappers connect properties, events and templates. Applications do not need to adopt one visual skin.

An ordinary Page may use wrappers directly. A reactive Page may use the same wrappers or call hooks and supply WXML/WXSS. A hook still needs real native nodes and event bindings: creating state alone does not connect a view.

## State and structure

Form controllers own model, registration and validation; applications supply business validation and upload adapters. Video separates playback intent from pause blockers and requires a real native video node. Swiper owns index/transition state while application components render content.

Declare hooks in synchronous setup and start instance effects through lifecycle hooks. Instances own their subscriptions/resources. Relation markers must come from shared modules rather than copied implementations.

## Optional wrappers

The following configuration combines Video and VideoGroup from the same package:

```json
{
  "usingComponents": {
    "rmp-video": "@reactive-mp/components/video/components/video/index",
    "rmp-group": "@reactive-mp/components/video/components/group/index"
  }
}
```

```xml
<rmp-group>
  <view style="height: 400rpx">
    <rmp-video src="{{videoUrl}}" />
  </view>
</rmp-group>
```

Supply an accessible videoUrl in page data and explicit container dimensions. The wrapper connects native behavior; the project owns layout and content. See [Video](video.md), [Swiper](swiper.md), [Form](form.md) and [Styling](styling.md) for supported slots and properties.

## Imports and resource lifetime

Root and domain entries share the same implementations. MediaSwiper reuses Video sound coordination inside the package. Component state does not enter an application-global Store. Networking, identity, navigation, analytics and visual identity belong to the consumer.
