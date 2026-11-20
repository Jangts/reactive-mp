# 样式与插槽

Hooks 不加载样式。可选原生 wrappers 提供基础结构；布局、品牌颜色和内容由项目管理。文档站主题不是应用必须采用的主题。

## 外部样式类与插槽

FormItem、字段 wrappers 与 Video 声明 custom-class。FormItem 提供 default、label、label-extra、description、suffix、help、error 插槽；替换文字时清空对应属性。Swiper/MediaSwiper 提供 overlay/footer 插槽；Video 的插槽见组件页。插槽只改变结构，不改变模型归属。

## CSS 变量

| 变量 | 源码回退值 |
| --- | --- |
| `--form-accent` | `#286f86` |
| `--form-border-color` | `#aaa` |
| `--form-border-color` | `#ccc` |
| `--form-border-color` | `#ddd` |
| `--form-color` | `#222` |
| `--form-control-padding` | `16rpx 0` |
| `--form-error-color` | `#c63535` |
| `--form-fill` | `#f3f3f3` |
| `--form-font-size` | `28rpx` |
| `--form-gap` | `12rpx` |
| `--form-help-size` | `24rpx` |
| `--form-item-gap` | `28rpx` |
| `--form-label-width` | `160rpx` |
| `--form-muted-color` | `#888` |
| `--form-radius` | `8rpx` |
| `--form-single-upload-size` | `240rpx` |
| `--form-surface` | `#fff` |
| `--form-upload-size` | `160rpx` |
| `--swiper-gap` | `0px` |
| `--swiper-indicator-color` | `currentColor` |
| `--swiper-origin` | `center` |
| `--swiper-rotate` | `0deg` |
| `--swiper-scale` | `1` |
| `--swiper-shift` | `0%` |

同一变量在不同规则中可能有不同回退值，表中保留实际值。--swiper-scale/rotate/shift/origin 由动效接线写入；通过 layout/peek/gap 控制轮播，不要与内部 transform 争夺布局。

## 布局归属

Video 和 Swiper 需要父级明确尺寸。FormItem 管理标签、控件与反馈间距，反馈保持正常文档流。应用宽度与公共 padding 放在所属容器，不重复施加到每个子控件。原生键盘、全屏和媒体行为需要在微信环境验证，不能由文档网页推断。
