# Reactive MP 文档站

共用的原生静态文档引擎，为每个公开包生成独立站点，并提供工作区总入口。需要 Node.js 22+，不运行后端。

## 构建与预览

从仓库根目录执行：

```sh
npm ci
npm run docs:api
npm run docs:check
npm run docs:build
npm run docs:dev
```

默认预览地址为 `http://127.0.0.1:4173`。开发服务只监听回环地址，`PORT` 可修改端口。总入口同时提供各公开包的独立站点链接和工作区维护导航。

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

`--package` 接受完整包名或 packages 下的目录名。单包预览将其独立产物直接作为站点根目录；单包构建只更新该包的输出，不删除其他站点。修改 docs、packages、examples 或渲染源码会重建；修改预览服务自身后需重启。

## 内容与导航

- 各公开包的 `reactiveMp.docs` 指向自己的 `docs/site.json`，登记标题、定位与分组导航。
- 各包 `docs/*.md` 是其使用文档的唯一来源，至少包含概览、快速上手、指南和 API。
- `navigation.mjs` 从实际公开包清单建立站点，维护者导航单独登记；内部支撑包不拥有独立产品站点。
- `scripts/api-reference.mjs` 从真实 exports 与类型生成各公开包的 `docs/api.md`，并生成工作区全量 `docs/api.md`。
- `<<< examples/...` 引用当前宿主源码，不维护第二份示例。构建展开代码，静态产物不再依赖仓库中的示例文件。
- `template.mjs` 以站点上下文生成导航、阅读顺序、品牌与版本；`styles.css` 负责共享布局，`client.mjs` 负责本地搜索、主题与移动目录。

站点版本来自所属包的 package.json。搜索与 API 按包隔离，使用导航不混入维护记录。包 README 链接自己的 docs，docs 与站点声明进入包的发布白名单。

## 独立交付

完整产物位于 `apps/docs/dist`。每个公开包的以下目录都可以单独复制、部署到域名根目录或子路径：

| 公开包 | 独立产物 |
| --- | --- |
| reactive-mp | apps/docs/dist/reactive-mp |
| @reactive-mp/reactivity | apps/docs/dist/reactivity |
| @reactive-mp/store | apps/docs/dist/store |
| @reactive-mp/wechat | apps/docs/dist/wechat |
| @reactive-mp/images-preloader | apps/docs/dist/images-preloader |
| @reactive-mp/components | apps/docs/dist/components |

每份产物包含自己的 index.html、指南、API、assets、搜索索引及所需源码页面，不依赖相邻包的输出或工作区文件。站内链接使用相对路径；源码页面随站点交付。总入口额外提供维护资料和全部包 API。

构建先检查所有链接和锚点。生成目录由工具拥有，不手动编辑；完整构建替换全部产物，单包构建替换对应目录。发布白名单检查同时核对 npm tarball 中的 docs 文件。

## 品牌素材与交互

正式 SVG 位于 `docs/assets/branding`，构建复制到每个站点的 assets。修改原件后重新构建，不编辑输出副本。

各站默认共用 Reactive MP 的标志。Reactive MP 是两个相同且不相接的开放回钩，接合处保留连续留白。组件库在自己的 docs/site.json 中声明 branding.icon 与 branding.logo，文件位于 packages/components/docs/assets；该变体沿用母标轮廓、青绿色系和字形，在连接臂增加分段以表达组件组合。构建、导航标志和 favicon 从同一站点声明读取。

主题默认跟随系统，手动选择保存在当前站点源的浏览器存储中。本地搜索只读取该站点的搜索索引，不发送关键词。目录和正文不依赖脚本，搜索、主题按钮和移动导航需要 JavaScript。

构建与本地预览不创建线上地址，线上托管配置与站点源代码分开维护。
