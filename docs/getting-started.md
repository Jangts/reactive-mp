# 开始开发

需要 Node 22+、npm，以及微信开发者工具。仓库使用 npm workspaces，不需要额外的 monorepo 编排器。

```sh
npm ci
npm run check
npm run dev
```

在微信开发者工具中打开 examples/integration。各宿主默认使用 touristappid；需要登录、分享等平台权限时，在本地项目配置中使用自己的 AppID，个人配置不提交。

npm run dev 持续将 packages 源码同步到宿主 vendor 目录。它只改写包导入路径，不转换 setup、WXML 或 WXSS。编辑 packages 后，开发者工具读取的就是当前实现，不需要发布包或手工复制。

普通业务只需从统一入口导入。宿主中的相对路径是为了让微信原生工具直接读取源码，发布消费者则使用 reactive-mp 包入口。

下面的代码直接来自可运行宿主：

<<< examples/integration/pages/index/index.js

对应原生模板：

<<< examples/integration/pages/index/index.wxml

请求、定时器等实例副作用放进生命周期 Hook；纯计算直接放在 setup 中。普通功能无需判断收集阶段或实例阶段。
