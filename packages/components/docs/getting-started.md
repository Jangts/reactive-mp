# 快速上手

## 安装与准备

需要微信原生小程序和 Node.js 22+。取得同一次交付的本地包体后，在消费工程根目录执行：

```sh
npm install --ignore-scripts --no-audit ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
npm install --save-dev --ignore-scripts --no-audit ./reactive-mp-store-1.0.0.tgz ./reactive-mp-1.0.0.tgz
npx reactive-mp-prepare --out ./vendor --package @reactive-mp/components
```

这些命令不假定公共 registry 已发布对应版本。源码仓库可运行 mkdir -p artifacts/packages，再运行 npm pack --workspaces --pack-destination artifacts/packages --ignore-scripts 产生包体。Store 是开发工具 reactive-mp 的依赖，不是 components 的运行依赖。

vendor 由工具独占，业务文件放在目录外。这里假定 vendor 与 pages 位于同一个小程序根目录。工作区使用 npm run examples:prepare 准备示例宿主。

## 第一个完整页面

在 pages/profile 中创建以下文件，并在 app.json 登记 pages/profile/index：

### index.json

<<< packages/components/docs/examples/input/index.json

### index.wxml

<<< packages/components/docs/examples/input/index.wxml

### index.js

任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。

::: code-group

<<< packages/components/docs/examples/input/index.js [原生配置式]

<<< packages/components/docs/examples/input/index.reactive.js [组合响应式]

:::

index.wxss 可以为空。输入名称，点击 Submit 可在页面看到提交的模型，Reset 恢复初值。

## 继续使用

- [组件总览](catalog.md)：逐组件查看属性、事件、插槽、方法和边界。
- [模型与校验](form-guide.md)：模型归属、异步规则和业务上传适配器。
- [Hooks](hooks.md)：只复用交互逻辑，自行组合结构。
- [样式与插槽](styling.md)：覆盖可选 wrapper 的基础外观。
