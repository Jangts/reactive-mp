# 快速上手

包采用原始 ESM JavaScript，不依赖 Reactive MP 运行时。取得交付的 tarball，在消费工程安装：

```sh
npm install ./reactive-mp-wechat-0.1.0.tgz
```

将安装包的 src 目录整体放到小程序根目录下的 vendor/wechat/src，保持目录结构。以下假定页面位于 pages/example；在对应 index.js 中使用：

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

index.wxml 绑定用户操作：

```xml
<button bindtap="login">登录</button>
```

index.json 声明空对象，app.json 登记此页面。点击后成功取得一次性 code；失败显示原生错误消息。业务登录接口由应用自己提供。

这里使用本地包体，不假定已发布到公共 registry。工作区开发运行 `npm run examples:prepare`，同样生成 vendor/wechat/src。

原生宿主可将安装包的 src 整体复制到 vendor/wechat/src，保持目录结构。也可安装 reactive-mp 作为开发工具，运行 `npx reactive-mp-prepare --out ./vendor --package @reactive-mp/wechat`，只准备本包及依赖。输出目录由工具独占管理。

标准包入口为 `@reactive-mp/wechat`；子入口 `@reactive-mp/wechat/wx` 提供原生封装，`@reactive-mp/wechat/network` 提供请求增强。原生源码分别对应 src/index.js、src/wx/index.js 和 src/network/index.js。完整交互示例为 integration 的“微信 API 封装示例”。
