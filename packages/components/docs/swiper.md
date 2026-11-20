# Swiper 轮播

协调索引、原生切换、稳定内容身份和可选轮播版式。

## 何时使用

用于图片或通过泛型内容组件展示的卡片。

## 基础用法

以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。

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

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

```js [原生配置式]
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

```js [组合响应式]
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

运行后可直接操作此 Swiper 示例；请先把示例中 /assets 下的图片或视频放入工程；点击或滑动可观察组件交互。

## 常用场景

layout="focus" 或 "coverflow" 提供相邻项展示；peek、gap 调整留白。默认泛型内容为 ImageItem，可用 generic:item 接入自己的内容组件。

### 相邻内容与指示器

替换基础示例的轮播，父容器继续保留确定高度。

```xml
<rmp-gallery id="gallery" items="{{items}}" item-key="id" layout="focus" peek="32px" gap="12px" indicator="{{true}}" />
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| items | `array` | `[]` | 内容项数组 |
| itemKey | `string` | `"id"` | 稳定身份字段；重复身份退化为索引 |
| current | `number` | `0` | 受控的零基索引 |
| circular | `boolean` | `false` | 是否循环；少于两项时自动关闭 |
| autoplay | `boolean` | `false` | 是否自动切换或播放，仍受可见性和平台策略限制 |
| interval | `number` | `5000` | 自动切换间隔，毫秒 |
| duration | `number` | `300` | 切换动画时长，单位毫秒。 |
| disableTouch | `boolean` | `false` | 是否禁用触摸切换 |
| layout | `string` | `"plain"` | plain、focus 或 coverflow |
| peek | `string` | `""` | 相邻项露出宽度，显式值覆盖版式默认值 |
| gap | `string` | `"0px"` | 内容项间距，带 CSS 单位 |
| indicator | `boolean` | `false` | 多项时是否展示内置指示点 |


## 事件

| 事件 | event.detail |
| --- | --- |
| change | {current,source}。 |
| animationfinish | {current,source?,...原生详情}。 |
| transitionstart | {dx,dy?}。 |
| itemclick | {index,active,item}。 |
| itemevent | {index,item,detail}。 |
| transition | {dx,dy?}。 |

## 插槽与样式

可用插槽：`overlay`, `footer`。 实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。

## 实例方法

在 onReady 后通过 this.selectComponent(selector) 取得原生实例。

| 方法 | 合同 |
| --- | --- |
| `to(index)` | 跳到目标索引，归一化越界值。 |
| `next()` | 切换到下一项，遵循 circular 与边界规则。 |
| `previous()` | 切换到上一项，遵循 circular 与边界规则。 |
| `refresh()` | 重新测量容器并刷新版式。 |

## 常见问题与边界

父容器必须确定高度。items 变更时通过 itemKey 保持身份；少于两项时不循环也不自动播放。to() 会归一化目标索引。

[无头 Hooks 与控制器](hooks.md) · [完整类型签名](api.md)
