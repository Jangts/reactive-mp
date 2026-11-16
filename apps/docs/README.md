# Reactive MP 文档站

原生静态文档站，直接消费仓库正文，无需运行后端。使用 Node.js 22+，从仓库根目录运行：

```sh
npm ci
npm run docs:dev
```

默认地址为 `http://127.0.0.1:4173`，用 `PORT` 修改端口。开发服务只监听本机回环地址，监听正文、示例和站点源码，自动重建；修改后刷新浏览器。修改预览服务 `serve.mjs` 自身后重启命令。

## 内容与导航

- `docs/*.md` 是正式正文与维护资料；`docs/README.md` 为仓库索引。
- `navigation.mjs` 集中登记页面、顺序、分组和读者身份；使用指南与维护资料分别导航。
- `docs/api.md` 由真实导出和类型声明生成：`npm run docs:api`。
- `<<< examples/...` 引用当前宿主源码，不维护第二份示例。
- `template.mjs` 负责外壳、目录、阅读顺序与首页标识；`styles.css` 负责布局与主题；`client.mjs` 负责搜索、主题与移动导航。

新增页面时同时登记导航；生成内容只改来源，不编辑 `dist`。

## 品牌素材

正式原件位于 `docs/assets/branding`：

- `reactive-mp-icon.svg`：双回环独立图标，供首页、导航和 favicon 使用。
- `reactive-mp-logo.svg`：图标与字标组合，供仓库 README 使用；文字已转轮廓。

构建从该目录复制到站点 `assets`。修改原件后重新构建，不单独修改副本。

## 检查与静态部署

```sh
npm run docs:check
npm run docs:build
```

产物为 `apps/docs/dist`，包含页面、样式、交互脚本、SVG 和本地搜索索引。将整个目录交给静态服务器即可；相对资源链接支持部署到子目录。搜索只在浏览器加载本站索引，不向外部服务发送关键词。

主题默认跟随系统，手动切换后保存在当前站点的浏览器存储中；禁用存储时仍可切换本页主题。目录与正文不依赖脚本，搜索、主题按钮和移动导航需要 JavaScript。

构建及本地预览不发布站点或 npm 包，不生成未经配置的线上地址。
