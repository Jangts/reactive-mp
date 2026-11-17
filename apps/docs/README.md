# Reactive MP 文档站

共用的原生静态文档引擎，为公开包生成文档站，并提供工作区总入口。Reactivity 由主包站点承载，其余公开包拥有各自站点。需要 Node.js 22+，不运行后端。

## 构建与预览

从仓库根目录执行：

```sh
npm ci
npm run docs:api
npm run docs:check
npm run docs:build
npm run docs:dev
```

默认预览地址为 `http://127.0.0.1:4173`。开发服务只监听回环地址，`PORT` 可修改端口。总入口提供各包文档及实际站点链接和工作区维护导航。

只构建或预览一个公开包：

```sh
npm run docs:build -- --package @reactive-mp/components
npm run docs:dev -- --package @reactive-mp/components
```

也可在对应包的工作区运行：

```sh
npm run docs:build -w @reactive-mp/components
npm run docs:dev -w @reactive-mp/components
```

`--package` 接受完整包名或 packages 下的目录名，并解析到承载该包文档的站点。因此选择 @reactive-mp/reactivity 会构建或预览 reactive-mp 主站。预览将所选站点产物作为根目录；定向构建只更新该站点，不删除其他站点。修改 docs、packages、examples 或渲染源码会重建；修改预览服务自身后需重启。

## 内容与导航

- 各公开包的 `reactiveMp.docs` 指向自己的 `docs/site.json`，登记标题、定位与分组导航；可用 `site` 指定承载它的公开包名，省略时拥有独立站点。
- 各包 `docs/*.md` 是其使用文档的唯一来源，至少包含概览、快速上手、指南和 API。
- `navigation.mjs` 从实际公开包清单读取随包文档，再按承载关系建立站点；构建、预览与部署共用同一解析。维护者导航单独登记，内部支撑包不拥有独立产品站点。
- `scripts/api-reference.mjs` 从真实 exports 与类型生成各公开包的 `docs/api.md`，并生成工作区全量 `docs/api.md`。
- `<<< examples/...` 引用当前宿主源码，不维护第二份示例。构建展开代码，静态产物不再依赖仓库中的示例文件。
- `template.mjs` 以站点上下文生成导航、阅读顺序、品牌与版本；`styles.css` 负责共享布局，`client.mjs` 负责本地搜索、主题与移动目录。

站点版本来自所属包的 package.json，被承载包在导航组显示自己的版本。搜索仅覆盖本站承载的文档，API 继续按包生成，使用导航不混入维护记录。包 README 链接自己的 docs，docs 与文档声明进入包的发布白名单；打包检查读取所有公开包的随包清单，不以独立站点清单替代。

## 独立交付

完整产物位于 `apps/docs/dist`。以下四个站点目录可单独复制、部署到域名根目录或子路径：

| 公开包 | 独立产物 | 线上文档 |
| --- | --- | --- |
| reactive-mp | apps/docs/dist/reactive-mp | [Reactive MP](https://reactive-mp-docs.pages.jangts.cafe/) |
| @reactive-mp/store | apps/docs/dist/store | [Store](https://reactive-mp-store-docs.pages.jangts.cafe/) |
| @reactive-mp/kit | apps/docs/dist/kit | [Reactive MP Kit](https://reactive-mp-kit-docs.pages.jangts.cafe/) |
| @reactive-mp/components | apps/docs/dist/components | [Reactive MP Components](https://reactive-mp-components-docs.pages.jangts.cafe/) |

每份产物包含自己的 index.html、指南、API、assets、搜索索引及所需源码页面，不依赖相邻包的输出或工作区文件。站内链接使用相对路径；源码页面随站点交付。总入口额外提供维护资料和全部包 API。

Reactivity 的概览、快速上手、指南和 API 位于主站的 `reactivity-index.html`、`reactivity-getting-started.html`、`reactivity-guide.html`、`reactivity-api.html`，不生成 `dist/reactivity`。源稿仍由 `packages/reactivity/docs` 独立维护，并随独立 npm 包交付。

Wechat、Images Preloader 的代码、类型和文档直接归入 Kit，不生成独立的包或站点。Kit 统一提供这两个领域的指南与 API，并说明 Store 转发。Store 的独立包、随包文档及站点保留。

构建先检查所有链接和锚点。生成目录由工具拥有，不手动编辑；完整构建替换全部产物，单包构建替换对应目录。发布白名单检查同时核对 npm tarball 中的 docs 文件。

## 部署

沿用 RESTModel、Agent Core 的武汉自建 Pages。连接与站点映射位于 `apps/docs/deploy.config.json`，密钥只引用本机文件路径，不保存内容。服务器共享合同见 Jangts 仓库的 `deploy/pages/README.md`。

```sh
npm run docs:deploy
npm run docs:deploy -- --package @reactive-mp/components
```

默认发布四个文档站，`--package` 只更新承载选定包文档的站点，选择 reactivity 同样更新主站。脚本先检查和构建文档，只打包对应的独立产物，不上传工作区维护入口。远端锁定选定目录，核对压缩包及全部文件的 SHA-256 后替换；替换失败恢复本批原站，保留其他 Pages 目录。随后从公网逐文件读取，核对内容、HTTP 类型、首页及缺失页面的 404；回执保存在 `artifacts/docs-deployment.json`。

浏览器模块产物使用 `assets/client.js`，让通用静态服务器返回正确的 JavaScript 类型。部署不会修改共享代理、DNS、证书，不发布 npm 包。部署后仍需区分 HTTP 内容校验和浏览器视觉验收。

2026-11-18 首次部署六个独立文档站，共 31 个正文页、92 个静态文件。远端文件清单及公网 HTTPS 逐文件 SHA-256 校验通过；每站首页、资源类型及缺失页面的真实 404 均通过。部署脚本另在临时目录验证了校验失败拒绝替换、目录隔离、跨站替换失败回滚和归档路径逃逸拒绝。本次未做浏览器视觉复验。

同日将 Reactivity 在线文档合入主站，当时为五个站点、31 个正文页、87 个静态文件，已全部重新部署并通过公网逐文件校验。主站承载 Reactivity 的四个页面、导航与搜索；旧独立站目录已移入服务器 Pages 根目录下的隐藏备份，旧站首页、指南和 API 均返回真实 404。迁移回执及恢复路径保存在 `artifacts/reactivity-docs-retirement.json`。六个公开 npm 包继续各自维护版本和随包文档，八个真实 tarball 的隔离消费、随包文档检查及两项文档回归通过，未执行 npm 发布或浏览器视觉复验。

随后新增 @reactive-mp/kit，将 Wechat、Images Preloader 的实现、类型与文档直接收进 kit；Store 保留独立包与站点，由 kit 转发同一实现。当前为五个公开包、四个文档站、34 个正文页和 89 个静态文件，已部署并通过公网逐文件校验。两个旧站已移入服务器隐藏备份，首页、指南与 API 均返回真实 404；Kit 页面、导航、搜索及 Store 独立站验证通过。回执与恢复路径见 `artifacts/kit-migration/retired-sites.json`。

Kit 合并后的 `npm run check` 通过 124 项测试、类型、文档和七个真实 tarball 的隔离消费；覆盖根入口、领域入口、Store 函数及默认导出身份、原生依赖闭包与旧 vendor 迁移。28 个迁移的实现、模板和类型文件与合并前 SHA-256 一致。原始快照及完整检查日志位于 `artifacts/kit-migration`，未执行 npm 发布、微信实机或浏览器视觉复验。

## 品牌素材与交互

正式 SVG 位于 `docs/assets/branding`，构建复制到每个站点的 assets。修改原件后重新构建，不编辑输出副本。

各站默认共用 Reactive MP 的标志。Reactive MP 是两个相同且不相接的开放回钩，接合处保留连续留白。组件库在自己的 docs/site.json 中声明 branding.icon 与 branding.logo，文件位于 packages/components/docs/assets；该变体沿用母标轮廓、青绿色系和字形，在连接臂增加分段以表达组件组合。构建、导航标志和 favicon 从同一站点声明读取。

主题默认跟随系统，手动选择保存在当前站点源的浏览器存储中。本地搜索只读取该站点的搜索索引，不发送关键词。目录和正文不依赖脚本，搜索、主题按钮和移动导航需要 JavaScript。

构建与本地预览不触发部署，只有 `docs:deploy` 更新线上站点。
