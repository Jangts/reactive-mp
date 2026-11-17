# 批次、缓存与生命周期

## 批次与资源寿命

`loadImages(images, { delay = false, timeout = 0 })` 返回 Promise：

```js
{
  total: 2,
  done: 1,
  fail: 1,
  results: [
    { src: '/assets/cover.jpg', status: 'loaded', width: 640, height: 480 },
    { src: '/assets/missing.jpg', status: 'error', errMsg: '...' },
  ],
}
```

- 输入为 URL/图片路径数组；忽略非字符串、空字符串和纯空白项。重复 URL 只加载一次，统计与 results 仍保留每个有效输入项，顺序与输入一致。空数组返回零计数。
- 多次调用可以并行；同一份包实例内的多个组件与 Hook 共享进行中的 URL 请求。成功记录命中时无需创建节点；失败、超时和取消不缓存，可再次调用重试。
- `delay: true` 等待当前宿主 ready 后启动，已经 ready 时立即启动。它不控制业务优先级，也不禁用 timeout。
- `timeout` 单位毫秒，从实际启动加载开始计算；默认 0，不设时限。一个等待项超时不影响其他等待者。希望等待时间有上限时，显式设置正数。
- 图片错误、超时、卸载分别返回 `error`、`timeout`、`cancelled`，都计入 fail；图片失败不 reject。参数类型错误或非法 timeout 才 reject。
- 完成后立即释放原生节点及任务引用。卸载结算该实例全部等待；仍有其他实例等待相同 URL 时，将节点交给其他实例重新加载，旧节点的迟到事件会被忽略。

组件通过方法返回结果，不通过自定义事件传递 Promise。

## 图片尺寸与缓存

```js
import {
  getLoadedImageSizeByUrl,
  clearImageCache,
} from '@reactive-mp/kit/images-preloader';

const { width, height } = getLoadedImageSizeByUrl('/assets/cover.jpg');
clearImageCache('/assets/cover.jpg');
clearImageCache();
```

成功结果包含原始尺寸，单位 px。共享缓存只保存最近使用的 256 个 URL 的尺寸；未加载、已淘汰或已清理的 URL 查询返回 `{}`。批量加载后需要完整尺寸时，直接使用该批次 `results`。

这不是图片文件持久缓存。成功记录表示本次包运行期间收到过 load，微信自身的缓存可能被系统淘汰；同一 URL 内容变化后，应清理成功记录或使用新 URL。`clearImageCache` 只删除成功元数据，不影响进行中的请求，不删除微信缓存。

## Reactive 页面直接使用 Hook

`useImagesPreloader()` 在 setup 中调用，返回 `images` Signal、`loadImages` 和两个原生事件处理器。自行编写视图时，必须渲染这些 image 并绑定事件；只调用 Hook 不会加载图片。

```js
import { definePage } from 'reactive-mp';
import { useImagesPreloader } from '@reactive-mp/kit/images-preloader';

definePage(() => {
  const loader = useImagesPreloader();
  return {
    ...loader,
    preload: () => loader.loadImages(['/assets/cover.jpg'], { timeout: 5000 }),
  };
});
```

对应页面 WXML：

```xml
<button bindtap="preload">预加载</button>
<view class="preload-images" aria-hidden="{{true}}">
  <image wx:for="{{images}}" wx:key="id" src="{{item.src}}"
    data-id="{{item.id}}" lazy-load="{{false}}"
    bindload="onImageLoad" binderror="onImageError" />
</view>
```

对应页面 WXSS：

```css
.preload-images {
  position: fixed;
  top: -2px;
  left: -2px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
.preload-images image { width: 1px; height: 1px; }
```

组件封装和 Hook 共用同一套请求与清理逻辑。原生 image 的格式支持、域名与缓存行为遵循微信平台。
