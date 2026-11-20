# Batches, cache and lifecycle

## Batch ownership

loadImages(images,{delay=false,timeout=0}) resolves a report with total, done, fail and ordered results. Ignore non-string, empty and whitespace-only inputs. Repeated URLs share one load, while counters/results still represent each valid input in order. Empty input returns zero counters.

Calls can run concurrently. Components and hooks in the same package instance share in-flight URL requests. A successful metadata hit avoids creating another image node. Failure, timeout and cancellation are not cached.

delay=true waits for host ready, or starts immediately if already ready. timeout is measured in milliseconds from actual loading; zero adds no limit. One waiting caller timing out does not cancel other callers.

Image failures resolve error/timeout/cancelled results and increment fail; they do not reject. Invalid parameters or timeout values reject. Completion releases native jobs. Unmount settles all this instance's waiters; when another instance still waits, ownership moves and loading restarts there. Late events from old nodes are ignored. Results are returned by methods, not through custom Promise events.

## Size and cache

Success contains original pixel dimensions. A shared least-recently-used cache keeps metadata for 256 URLs. Missing, evicted or cleared URLs return {}. Read complete dimensions for a batch from its results.

This is not persistent image-file storage. WeChat may evict its own image cache. If a URL changes content, clear its success record or use a new URL. clearImageCache removes success metadata, not active loads or WeChat's own cache.

## Direct hook integration

Call useImagesPreloader inside synchronous setup. It returns an images Signal, loadImages and native load/error handlers. Render the jobs as native image nodes and bind both handlers; constructing the hook alone does not load images.

Complete result, lookup, hook, WXML and WXSS examples:

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

```js
import {
  getLoadedImageSizeByUrl,
  clearImageCache,
} from '@reactive-mp/kit/images-preloader';

const { width, height } = getLoadedImageSizeByUrl('/assets/cover.jpg');
clearImageCache('/assets/cover.jpg');
clearImageCache();
```

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

```xml
<button bindtap="preload">预加载</button>
<view class="preload-images" aria-hidden="{{true}}">
  <image wx:for="{{images}}" wx:key="id" src="{{item.src}}"
    data-id="{{item.id}}" lazy-load="{{false}}"
    bindload="onImageLoad" binderror="onImageError" />
</view>
```

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

The component and hook share the same logic. Native image format, legal-domain and cache behavior remain controlled by WeChat.
