# 文档站部署与验证记录

2026-11-18 首次部署六个独立文档站，共 31 个正文页、92 个静态文件。远端文件清单及公网 HTTPS 逐文件 SHA-256 校验通过；每站首页、资源类型及缺失页面的真实 404 均通过。部署脚本另在临时目录验证了校验失败拒绝替换、目录隔离、跨站替换失败回滚和归档路径逃逸拒绝。本次未做浏览器视觉复验。

同日将 Reactivity 在线文档合入主站，当时为五个站点、31 个正文页、87 个静态文件，已全部重新部署并通过公网逐文件校验。主站承载 Reactivity 的四个页面、导航与搜索；旧独立站目录已移入服务器 Pages 根目录下的隐藏备份，旧站首页、指南和 API 均返回真实 404。迁移回执及恢复路径保存在 `artifacts/reactivity-docs-retirement.json`。六个公开 npm 包继续各自维护版本和随包文档，八个真实 tarball 的隔离消费、随包文档检查及两项文档回归通过，未执行 npm 发布或浏览器视觉复验。

随后新增 @reactive-mp/kit，将 Wechat、Images Preloader 的实现、类型与文档直接收进 kit；Store 保留独立包与站点，由 kit 转发同一实现。当前为五个公开包、四个文档站、34 个正文页和 89 个静态文件，已部署并通过公网逐文件校验。两个旧站已移入服务器隐藏备份，首页、指南与 API 均返回真实 404；Kit 页面、导航、搜索及 Store 独立站验证通过。回执与恢复路径见 `artifacts/kit-migration/retired-sites.json`。

Kit 合并后的 `npm run check` 通过 124 项测试、类型、文档和七个真实 tarball 的隔离消费；覆盖根入口、领域入口、Store 函数及默认导出身份、原生依赖闭包与旧 vendor 迁移。28 个迁移的实现、模板和类型文件与合并前 SHA-256 一致。原始快照及完整检查日志位于 `artifacts/kit-migration`，未执行 npm 发布、微信实机或浏览器视觉复验。


## 组件逐页参考与全站双语（2026-11-18）

四个公开站点统一采用既有 VitePress 1.6.4 主题与 RESTModel 品牌样式，提供 /zh/、/en/、同篇语言切换、按语言检索、canonical/hreflang 和语言入口。Components 按真实源码提供 22 个原生组件的独立参考：完整 JS/JSON/WXML、场景、属性默认值、事件、插槽、实例方法与 FAQ；另有模型校验、Hooks 和样式指南。

当前为 57 个正文路由、114 个语言页面；Components 为 30 个正文路由，其中 22 个逐组件参考。四站 727 个静态文件已部署并经公网逐文件 SHA-256、类型与 404 检查；最终公网审阅另读取全部 44 个中英文组件页，核对章节、示例、语言互链和规范链接，回执为 artifacts/docs-redesign/live-audit.json。组件后续语义核对和离线 Markdown 交付更新的单站部署回执见 artifacts/docs-redesign/deploy-components-portable.log。

本次 npm run check 通过 126 项测试、类型、格式和七个真实 tarball 的隔离消费，并核对中英文随包文档。后续文案和生成器调整通过组件文档测试、导航/缺译检查和最终构建。组件示例源文件作为唯一代码来源，生成到 Markdown 代码块中，npm 消费者可直接阅读完整组件示例；原始 JS/JSON/WXML 同时随包交付。

验证还覆盖子路径部署的资源与双语导航，以及本地 HTTP 的字体二进制、JavaScript 和语言搜索索引分块。完整全量检查日志位于 artifacts/docs-redesign/check.log。浏览器工具 getState 连接超时，因此没有浏览器视觉验收；本次也没有微信实机复验。没有改动组件运行逻辑、没有执行 npm 发布。
