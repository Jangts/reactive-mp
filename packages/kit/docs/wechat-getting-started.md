# 快速上手

先按 [Kit 快速上手](getting-started.md)安装包体并准备原生源码。Wechat 是 Kit 的内部领域，逻辑不要求响应式页面。以下假定页面位于 pages/example；在对应 index.js 中使用：

```js
// pages/example/index.js
import { wxLogin, wxShowToast } from '../../vendor/kit/miniprogram/wechat/index.js';

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

这里使用本地包体，不假定已发布到公共 registry。工作区开发运行 `npm run examples:prepare`，同样生成 vendor/kit/miniprogram/wechat。

标准入口为 `@reactive-mp/kit/wechat`；子入口 `@reactive-mp/kit/wechat/wx` 提供原生封装，`@reactive-mp/kit/wechat/network` 提供请求增强。它们分别对应 miniprogram/wechat/index.js、miniprogram/wechat/wx/index.js 和 miniprogram/wechat/network/index.js。完整交互示例为 integration 的“微信 API 封装示例”。
