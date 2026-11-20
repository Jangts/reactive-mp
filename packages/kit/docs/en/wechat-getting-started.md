# WeChat integration

Install archives and prepare native sources as described in [Quick start](getting-started.md). WeChat is an internal Kit domain and does not require a reactive Page. The example page lives at pages/example:

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

```xml
<button bindtap="login">登录</button>
```

Use an empty index.json and register the page in app.json. The button requests a one-time login code; failures display the native error message. Applications implement their own code-exchange endpoint.

npm run examples:prepare produces vendor/kit/miniprogram/wechat in source hosts. Standard entries are @reactive-mp/kit/wechat, /wechat/wx and /wechat/network, corresponding to miniprogram/wechat/index.js, wx/index.js and network/index.js. AppID and user-interaction restrictions still apply.
