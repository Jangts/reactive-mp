# Styling and slots

Hooks do not load styles. Optional native wrappers include base structure; the application owns its layout, brand colors and content. The documentation theme is not a mandatory application theme.

## External classes and slots

FormItem, field wrappers and Video declare custom-class. FormItem supports default, label, label-extra, description, suffix, help and error slots. Clear matching text properties when replacing them with slots. Swiper/MediaSwiper expose overlay/footer slots. Video slot names are listed on its component page. A slot changes structure, not model ownership.

## CSS variables

| Variable | Fallback in the source |
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

A variable may have different fallbacks in different rules; the table retains those real values. --swiper-scale/rotate/shift/origin are written by motion behavior. Use layout/peek/gap to control the carousel rather than fighting those internal transforms.

## Layout responsibility

Video and Swiper require an explicitly sized parent. FormItem owns its label/control/feedback spacing. Keep feedback in normal flow. Put application width and shared padding on the containing layout rather than duplicating them on every child. Native keyboard, fullscreen and media behavior must be verified in WeChat rather than inferred from this website.
