# 快速上手

Kit 以原始 ESM JavaScript 交付，使用图片预加载能力需要微信原生宿主。运行依赖为 @reactive-mp/runtime、@reactive-mp/reactivity 和 @reactive-mp/store；shared 由依赖闭包引入。

## 安装本地交付包

取得匹配版本的 tarball，在小程序 npm 工程执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-store-1.0.0.tgz ./reactive-mp-kit-0.1.0.tgz
```

不假定这些版本已发布到公共 registry。包体可由源码仓库执行 `mkdir -p artifacts/packages`，再运行 `npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts` 产生。

## 准备原生源码

使用 reactive-mp 提供的开发工具，将所需包的源码与依赖闭包准备到工具独占的 vendor：

```sh
npm install --save-dev --ignore-scripts --no-audit ./reactive-mp-1.0.0.tgz
npx reactive-mp-prepare --out ./vendor --package @reactive-mp/kit
```

输出包含 kit、store、runtime、reactivity、shared，原有业务文件不要放入这个生成目录。源码工作区可直接运行 `npm run examples:prepare`，在 examples 宿主中验证。

## 选择首次接入

- [Wechat 接入](wechat-getting-started.md)：用页面按钮触发原生登录，取得结果或展示失败消息。
- [图片预加载接入](images-preloader-getting-started.md)：注册隐藏原生组件，取得批次统计和图片尺寸。
- [Store 转发](store.md)：复用独立 Store 包，保持相同的状态定义与清理合同。

使用支持包导入的工程时，逻辑入口为 @reactive-mp/kit/wechat、@reactive-mp/kit/images-preloader 和 @reactive-mp/kit/store。原生源码工程从 vendor/kit/miniprogram 下的对应入口导入；原生组件的 JSON 路径见各领域接入页。
