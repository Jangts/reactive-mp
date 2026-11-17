# @reactive-mp/wechat

微信原生 API 的结果式封装及请求增强。支持普通 Page、Component 和 Reactive MP，无运行时依赖。导入不要求 wx 存在，不启动登录、请求、弹窗或监听。

## 接入

包采用原始 ESM JavaScript。工作区执行 `npm run examples:prepare` 后，在原生页面中使用：

```js
// pages/example/index.js
import { wxLogin, wxShowToast } from '../../vendor/wechat/src/index.js';

Page({
  async login() {
    const [ok, code] = await wxLogin();
    if (!ok) {
      await wxShowToast(code.message);
      return;
    }
    // 将 code 交给应用自己的登录接口。
  },
});
```

给页面按钮绑定 login 后，成功取得一次性 code；失败显示原生错误消息。

本地交付可在仓库根执行 `npm pack ./packages/wechat --pack-destination ./artifacts`，消费工程执行 `npm install /path/to/reactive-mp-wechat-0.1.0.tgz`。不假定已发布到公共 registry。

原生宿主可将安装包的 src 整体复制到 vendor/wechat/src，保持目录结构。也可安装 reactive-mp 作为开发工具，运行 `npx reactive-mp-prepare --out ./vendor --package @reactive-mp/wechat`，只准备本包及依赖。输出目录由工具独占管理。

标准包入口为 `@reactive-mp/wechat`；子入口 `@reactive-mp/wechat/wx` 提供原生封装，`@reactive-mp/wechat/network` 提供请求增强。原生源码分别对应 src/index.js、src/wx/index.js 和 src/network/index.js。完整交互示例为 integration 的“微信 API 封装示例”。

## 文档

[概览](./docs/index.md) · [快速上手](./docs/getting-started.md) · [使用指南](./docs/guide.md) · [API 参考](./docs/api.md)
