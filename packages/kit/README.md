# Reactive MP Kit

npm 包：`@reactive-mp/kit`。

面向原生微信小程序的工具集合，提供 Wechat API 封装、Images Preloader，以及独立 Store 包的转发入口。按任务使用领域入口，也可从根入口取得相同的 API。导入逻辑入口不启动微信操作、不注册原生组件。

## 安装与接入

取得同一次交付的匹配版本 tarball，在消费工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-kit-0.1.0.tgz
npm install --save-dev --ignore-scripts --no-audit ./reactive-mp-1.0.0.tgz
npx reactive-mp-prepare --out ./vendor --package @reactive-mp/kit
```

包体可由源码仓库执行 `mkdir -p artifacts/packages` 和 `npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts` 产生。这里使用本地交付，不假定相应版本已发布到公共 registry。reactive-mp 提供原生源码准备工具；vendor 是工具独占的生成目录。

## 首次使用

在已登记的 `pages/example/index.js` 中使用：

```js
import { wxLogin, wxShowToast } from '../../vendor/kit/miniprogram/wechat/index.js';

Page({
  async login() {
    const [ok, code] = await wxLogin();
    if (!ok) {
      await wxShowToast(code.message);
      return;
    }
    // 将一次性 code 交给项目自己的登录接口。
  },
});
```

在页面 WXML 中添加 `<button bindtap="login">登录</button>`，页面 JSON 为 `{}`，app.json 登记该页面。点击按钮触发原生登录，失败显示错误。AppID、权限、合法域名及业务鉴权由项目提供。

## 领域入口

| 入口 | 用途 |
| --- | --- |
| `@reactive-mp/kit` | 全部命名 API，与各领域入口复用同一实现 |
| `@reactive-mp/kit/wechat` | 微信 API 与请求增强 |
| `@reactive-mp/kit/wechat/wx` | 登录、路由、缓存、原生请求和任务 |
| `@reactive-mp/kit/wechat/network` | 请求客户端、错误和并发控制 |
| `@reactive-mp/kit/images-preloader` | 图片预加载 Hook、共享请求与尺寸查询 |
| `@reactive-mp/kit/store` | 直接转发独立 `@reactive-mp/store`，包含其默认导出 |

Images Preloader 的原生组件入口为 `@reactive-mp/kit/images-preloader/components/images-preloader/index`，源码准备后的路径为 `/vendor/kit/miniprogram/images-preloader/components/images-preloader/index`。完整 JSON、WXML 和 JS 接线见[图片预加载接入](docs/images-preloader-getting-started.md)。

Wechat 和 Images Preloader 是 kit 内部领域，版本随 kit 维护。Store 保留独立 npm 包、版本和文档站；kit 依赖并转发它，所有入口复用同一函数与共享状态定义。

## 文档

[在线文档](https://reactive-mp-kit-docs.pages.jangts.cafe/) · [概览](docs/index.md) · [快速上手](docs/getting-started.md) · [指南](docs/guide.md) · [API 参考](docs/api.md)

[完整类型](index.d.ts) · [逻辑入口](miniprogram/index.js)。
