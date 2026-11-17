# @reactive-mp/components/swiper

微信小程序轮播组件与响应式 Hook。容器提供特征版式、滑动联动、索引控制和通用事件，内容通过 generic 组件组合。

## 普通页面与 Reactive 页面

按[统一组件包接入](../README.md)安装 `@reactive-mp/components`，在微信开发者工具构建 npm。两种页面使用相同的组件配置：

```json
{
  "usingComponents": {
    "rmp-swiper": "@reactive-mp/components/swiper/components/swiper/index"
  }
}
```

```xml
<view style="height: 400rpx">
  <rmp-swiper id="gallery" items="{{items}}" layout="focus" circular indicator
    bind:change="onChange" bind:animationfinish="onAnimationFinish" />
</view>
```

默认内容为原生 image，数据为 `{ id, src, mode? }`。容器需要明确高度。普通 Page 使用 data/setData；Reactive Page 返回 Signal。两者均可通过 `selectComponent('#gallery')` 调用 `to(index)`、`next()`、`previous()`、`refresh()`。

## 版式

| layout | 规则 |
| --- | --- |
| plain | 平铺，不缩放或旋转 |
| focus | 两侧露出，中心突出，相邻项缩小 |
| coverflow | 两侧露出、缩放及侧翼旋转 |

版式自带协调后的默认值，由公开目录 `swiperLayouts` 定义。`peek` 覆盖两侧露出范围，`gap` 设置项间距；卡片内部排版、圆角和外观由内容组件决定。容器统一承担变换，自定义内容无需读取效果变量。

行为属性：`current=0`、`circular=false`、`autoplay=false`、`interval=5000`、`duration=300`、`disableTouch=false`、`itemKey='id'`、`indicator=false`。时长单位毫秒。未知版式按 plain 展示。空列表索引为 0，非循环索引截断，循环索引取模；单项关闭原生循环和自动播放。

`itemKey` 是数据字段名，用于稳定列表身份；缺失或重复值回退为位置身份，动态重排应提供唯一键。首次异步加载数据时保留配置的初始 current；之后替换列表保留当前位置并修正越界索引，不按内容身份自动跟随。

## 自定义内容与媒体

注册自定义卡片，使用 `generic:item="my-card"`。内容组件接收 `item`、`index`、`active`。active 表示已完成切换的项，视频等内容可据此暂停。内容通过 `itemevent` 发出自定义通知，容器追加索引和内容后转发。footer、overlay 命名插槽提供说明区和覆盖内容；覆盖层定位由调用方负责。

图片与视频混排并参与声音分组时，使用媒体轮播组件：

```json
{
  "usingComponents": {
    "rmp-media-swiper": "@reactive-mp/components/swiper/components/media-swiper/index",
    "rmp-group": "@reactive-mp/components/video/components/group/index"
  }
}
```

```xml
<rmp-group>
  <view style="height: 400rpx">
    <rmp-media-swiper items="{{media}}" layout="coverflow"
      bind:itemevent="onItemEvent" />
  </view>
</rmp-group>
```

媒体数据为 `{ id, type: 'image' | 'video', src, poster?, mode?, muted?, loop? }`。视频复用同包的 video 领域，非激活项暂停；激活项自动播放，默认静音并循环。用户主动暂停后，切走再切回仍保持暂停。视频声音互斥由外部 rmp-group 管理。开启声音、播放汇总与错误通过 itemevent 转发，detail 为 `{ index, item, detail: { type, detail } }`。核心轮播不解释媒体类型或播放策略。

初始配置和后续属性更新中的 `muted: false` 也参与声音互斥；同一批数据有多个视频请求声音时取最后一个。声音按钮的 `mutedchange` 同样经 itemevent 转发。用户关声或被分组静音后，修改其他字段不会重新开启声音。

原生 swiper 的内容边界会隔开内部视频与外部 group 的原生关系。media-swiper 因此作为整体参与外层声音分组，协调内部媒体的静音状态；group 可同时包含独立 video 与多个 media-swiper。低层 media-item 可单独用于自定义内容，但跨轮播声音协调使用 media-swiper。

媒体轮播提供相同的索引方法、版式、footer/overlay 插槽和通用事件，另外公开 mute()。响应式组件可用 useMediaSwiper(props, options) 自行组合媒体轮播；返回 mediaItems、控制方法及事件处理函数。

## Hooks

```js
import { definePage, useSignal } from 'reactive-mp';
import { useSwiper } from '@reactive-mp/components/swiper';

definePage(() => {
  const [items] = useSignal([{ id: 'a' }, { id: 'b' }]);
  return useSwiper({ get items() { return items(); }, circular: true });
});
```

`useSwiper(props, { emit? })` 可在 Page 或 Component setup 中调用。返回 current、applied、count、entries、transitioning、renderOptions、previousMargin、nextMargin 等 Signal 和控制方法。属性应为响应式对象或 getter。页面通过 emit 接收事件，组件默认 triggerEvent。

使用自定义原生 swiper 视图时，绑定 current、change、transition、animationfinish 到 Hook 返回项。Hook 的 onTransition 在 JS 中更新状态；包内组件通过 WXS 实现连续变换，只在开始和完成时通知 JS。Hook 本身不为任意模板自动附加版式效果。

## 事件

- change：索引改变，detail `{ current, source }`。source 为原生来源或 property、items、method。
- transitionstart：包内组件的一次滑动开始，detail 含 dx。
- animationfinish：动画完成，更新 applied，detail 含 current/source。
- itemclick：非滑动过程点击，detail `{ index, item, active }`。
- itemevent：内容通知，detail `{ index, item, detail }`。

包内组件不逐帧向 JS 转发 transition。程序修改 current 先触发 change，再等待原生动画完成；非零初始索引直接初始化。尺寸改变后可调用 refresh 重新计算静态版式。

## 源码与验证

目录分为 components、hooks、utils。源码宿主运行 `npm run examples:prepare` 后，组件位于 `/vendor/components/miniprogram/swiper/components/`。integration 的 Swiper 示例包含传统页面、Reactive 页面、自定义内容和媒体组合。

Node 测试覆盖索引、动态列表、版式插值、事件和包体。原生 swiper 动画、WXS 节点时序、视频在变换容器中的显示及 npm 构建需要开发者工具和真机验证。
