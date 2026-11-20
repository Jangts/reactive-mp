# Reactive MP 文档站

四个公开站点共用 VitePress 1.6.4 与既有 RESTModel 文档站的默认主题和品牌 CSS。公开正文全部提供中文和英文；工作区维护资料单独生成，不进入公开站点的使用导航。

## 构建与预览

需要 Node.js 22+。首次安装用 npm ci，日常从仓库根目录执行：

```sh
npm run docs:components
npm run docs:api
npm run docs:check
npm run docs:build
npm run docs:dev -- --package @reactive-mp/components
```

默认 docs:dev 预览 Reactive MP 主站。--package 接受公开包名或目录名；Reactivity 解析到承载其文档的主站。也可运行 npm run docs:build -w @reactive-mp/components。预览仅监听回环地址，默认端口 4173，可通过 PORT 修改；默认根入口根据浏览器语言和已保存选择进入 /zh/ 或 /en/。

## 风格、组织与语言

公开站点复用 VitePress 的首页、顶部导航、侧栏、页内目录、上下篇、移动导航、深浅主题与代码复制，不维护第二套外观。品牌 CSS 位于 apps/docs/theme/style.css，来自既有 RESTModel 文档站；组件库使用自己的派生标志，其他包使用 Reactive MP 母标。主题不约束消费项目的组件样式。

组件内容组织参考 [Ant Design Mobile](https://mobile.ant.design/zh/components/input/) 的逐组件文档方式：何时使用、完整示例、常用场景、属性、事件、插槽/样式、实例方法及 FAQ。组件属性和默认值从真实源码提取；每个原生 wrapper 必须在目录中有对应页面，不能以领域总览替代组件用法。

- packages/<包>/docs 是中文源稿，docs/en 是对应英文源稿，均随 npm 包交付。
- docs/site.json 统一登记 description/descriptionEn、title/titleEn 和逐页中英文标题；导航、路由、搜索与 API 使用同一清单。
- 包可用 site 指定承载它的公开站点。Reactivity 由主站承载，独立 npm 身份与随包文档保留。
- components.json 保存逐组件内容与差异场景；examples/<组件> 保存随包交付的完整示例。原生配置式和组合响应式分别使用 index.js 与 index.reactive.js，共用 JSON 和 WXML，文档站使用 VitePress 代码标签切换。component-docs.mjs 只读属性声明，不执行组件注册。
- API 的中英文签名由同一 exports 和 TypeScript 声明生成，正文、导航或参数语义不使用中文回退冒充翻译。
- 两种语言使用同一页路径，切换语言保留当前文章。canonical、hreflang 和 sitemap 对应实际语言 URL。
- 本地搜索按语言建立索引，使用分词支持中文和英文检索，不上传关键词。

Markdown 中的 <<< 路径从真实源码展开。组件示例位于该包自己的 docs/examples，并由生成器展开为普通 Markdown 代码块；独立 npm 消费者可直接阅读完整示例，也取得全部原始接线文件。

## 产物与部署

| 公开站点 | 产物 | 地址 |
| --- | --- | --- |
| Reactive MP（含 Reactivity） | apps/docs/dist/reactive-mp | [主站](https://reactive-mp-docs.pages.jangts.cafe/) |
| Reactive MP Components | apps/docs/dist/components | [组件站](https://reactive-mp-components-docs.pages.jangts.cafe/) |
| Reactive MP Kit | apps/docs/dist/kit | [Kit](https://reactive-mp-kit-docs.pages.jangts.cafe/) |
| Store | apps/docs/dist/store | [Store](https://reactive-mp-store-docs.pages.jangts.cafe/) |

指定包构建可通过 DOCS_BASE=/components/ 与 DOCS_ORIGIN 设置子路径和规范域名，缺省为独立域名根路径。每个目录可以独立作为站点根目录交付，包含 /zh/、/en/、所需静态资源和源码参考页。根入口与历史扁平 .html 地址只负责语言路由，历史链接仍可使用。apps/docs/dist 根目录另有工作区维护入口，不对外部署。

```sh
npm run docs:deploy
npm run docs:deploy -- --package @reactive-mp/components
```

沿用武汉自建 Pages，配置见 apps/docs/deploy.config.json，连接只引用本机 SSH 身份文件。部署先检查和构建，远端校验压缩包及全部文件 SHA-256 后替换目标目录，失败恢复原站；随后逐文件检查公网内容和类型，并检查真实 404。回执位于 artifacts/docs-deployment.json。不修改共享代理、DNS、证书或其他服务，不执行 npm 发布。

## 验证

检查拒绝缺译、目录漏项、陈旧签名/属性表、无效源码引用和丢失的链接/锚点。组件示例校验真实组件 JSON 路径、JS 解析、WXML 处理器与 Form 事件回写。构建测试覆盖独立目录交付、双语互链、语言偏好、查询与片段保留、搜索索引隔离；真实 tarball 检查核对中英文随包文档。

HTTP 内容一致性、浏览器视觉验收与微信原生行为是不同证据。实际部署和验证记录见[部署记录](deployment.md)。构建与本地预览不触发部署。
