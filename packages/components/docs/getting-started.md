# 快速上手

## 安装本地交付包

需要微信原生宿主。取得同一次交付的匹配版本 tarball，在小程序 npm 工程安装：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
```

components 是独立版本的公开包，form、video、swiper 是内部领域，无需分别安装。这里说明本地包体，不假定 registry 已发布对应版本。

## 用 Hook 驱动原生结构

微信 npm 构建完成后，在 pages/gallery/index.js 使用：

```js
import { definePage } from '@reactive-mp/runtime';
import { useSwiper } from '@reactive-mp/components/swiper';

definePage(() => useSwiper({ items: ['第一项', '第二项'], circular: true }));
```

index.wxml 由项目自己提供：

```xml
<text>当前索引：{{current}}</text>
<button bindtap="previous">上一项</button>
<button bindtap="next">下一项</button>
```

页面 JSON 声明空对象，WXSS 按项目需要书写，app.json 登记此页面。初始索引为 0，点击下一项变为 1，再次点击循环回到 0。

源码工作区运行 `npm run examples:prepare` 后，原生宿主从 vendor/runtime/src/index.js 和 vendor/components/miniprogram/swiper/index.js 的对应相对路径导入。准备后的代码保留同一套状态与生命周期实现。需要现成接线时，使用各领域文档中的可选 wrappers。
