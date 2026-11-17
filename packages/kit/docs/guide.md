# 按能力选择入口

## 微信 API 与请求增强

@reactive-mp/kit/wechat 提供全部微信封装；/wechat/wx 和 /wechat/network 可分别使用。API 保留成功和失败结果、原生响应和任务控制，导入时不启动微信操作。领域逻辑不依赖响应式宿主；[结果与原生任务](wechat-guide.md)及[请求增强](wechat-network.md)说明完整合同。

## 图片预加载

@reactive-mp/kit/images-preloader 提供 Hook、尺寸查询与缓存清理。普通 Page 可使用原生组件，Reactive 页面可使用组件或 Hook 自己渲染加载节点。预加载节点、请求共享、批次结果和卸载清理由同一套内部逻辑管理，详见[使用指南](images-preloader-guide.md)。

## 共享 Store

@reactive-mp/kit/store 直接转发 @reactive-mp/store，根入口也提供 defineStore 和 storeToRefs。Store 保留独立包、独立版本与[完整文档站](https://reactive-mp-store-docs.pages.jangts.cafe/)，Kit 不复制它的源码或建立另一份共享状态。具体用法见[Store 转发](store.md)。

## 导入与版本

根入口 @reactive-mp/kit 导出各领域相同的命名 API；需要某个领域时直接使用其子入口。逻辑入口不注册组件，原生 wrapper 只通过 JSON 中登记的组件路径接入。

Kit 维护自己的公开版本，Wechat、Images Preloader 随 kit 交付。Store 的依赖版本由 kit 的 package.json 明确声明，与 kit 自身版本分开维护。
