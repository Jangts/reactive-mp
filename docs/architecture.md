# 架构与贡献

## 包边界

| 包 | 责任 | 依赖 |
| --- | --- | --- |
| @reactive-mp/shared | 事件总线、微任务调度、通用工具 | 无 |
| @reactive-mp/reactivity | Signal、computed、watch、对象代理和作用域 | shared |
| @reactive-mp/store | 惰性共享状态与独立生命周期 | reactivity |
| @reactive-mp/runtime | setup 收集、实例连接、平台适配和小程序 Hook | shared / reactivity |
| reactive-mp | 用户统一入口 | 以上四包 |
| @reactive-mp/kit | 微信 API、图片预加载及独立 Store 的转发入口 | runtime / reactivity / store |
| @reactive-mp/components | 表单、视频、轮播的交互状态、Hooks 和原生 wrappers | runtime / reactivity |

components 是组件领域的统一发布包。form、video、swiper 保留独立的领域目录和子入口，不再声明独立 package.json；源码与类型直接随统一包交付，不通过未发布的内部 npm 包连接。

kit 是工具能力的统一发布包。wechat、images-preloader 的实现和类型直接放在 kit 内，通过 /wechat、/images-preloader 及更细的公开子入口使用，不保留独立 npm 包。Store 继续作为 @reactive-mp/store 独立发布，kit 的根入口与 /store 直接转发其命名 API，/store 同时转发默认导出；不复制 Store 实现，原生准备后的转发也指向同一依赖包。

组件库追求无头能力：behaviors、Hooks 与 wrappers 复用状态、交互和原生接线，业务布局与视觉由项目决定。逻辑入口不注册组件或加载样式；现有可选 wrappers 仍带默认结构和基础样式，不能把发布边界调整等同于已经完成全部无头化改造。

包的 reactiveMp.previousNativeFolders 记录合并前的生成目录名，供准备工具迁移已标记的 vendor；未知目录和符号链接继续拒绝接管。

reactivity 与 store 不认识 wx。runtime 只在注册 API 被调用时接触 Page/Component/Behavior，不在导入包时注册平台监听。lib/index.js 是兼容的统一入口，不包含另一份实现。

生命周期和平台事件以 runtime 的 constants 声明表为基础，集中驱动转发。上下文进入和恢复由 RuntimeContext 的作用域方法维护；注册配置由闭包持有，不写入 data。实例作用域拥有订阅与清理任务。

## 版本归属

公开包各自维护版本；专属内部包跟随使用它的所属包；共用内部包跟随主包。版本归属与 npm 访问权限分开：当前源码分发需要 runtime、shared 作为可安装依赖随主包交付，不设置 private=true。

| 包或内部领域 | 发布角色 | 版本来源 |
| --- | --- | --- |
| reactive-mp | 公开主包 | 独立维护 |
| @reactive-mp/reactivity | 公开包 | 独立维护 |
| @reactive-mp/store | 公开包 | 独立维护 |
| @reactive-mp/kit | 公开包 | 独立维护 |
| @reactive-mp/components | 公开包 | 独立维护 |
| @reactive-mp/runtime、@reactive-mp/shared | 共用内部包 | reactive-mp |
| components 内的 form、video、swiper | 专属内部领域 | @reactive-mp/components；不单设包版本 |
| kit 内的 wechat、images-preloader | 专属内部领域 | @reactive-mp/kit；不单设包版本 |

根 package.json 的 reactiveMp.mainPackage 声明主包名称。每个 workspace 包在 reactiveMp.release.type 中登记 public、internal 或 shared-internal；internal 用 owner 指向实际依赖它的所属包，shared-internal 从主包取得版本。包清单驱动版本同步和检查，不另维护一份包名列表。

调整目标公开包的 package.json.version 后执行：

```sh
npm run versions:sync
npm run versions:check
npm run packages:check
```

同步命令只更新内部包版本、工作区精确依赖和锁文件，不递增其他公开包的版本，也不执行发布。依赖版本仍需与包自身版本区分：components 可以保持自己的 0.1.0，同时声明使用 1.0.0 的 runtime。工作区 dependencies、devDependencies 和 optionalDependencies 使用对应包的精确版本；外部依赖及 peerDependencies 的兼容范围由各包自行维护。

依赖变动的公开包仍需按自己的发布节奏选择新版本，不能用已发布的版本号重复交付修改后的包体。packages:check 包含版本与锁文件检查，npm run check 通过该入口执行同一检查。

## 文档维护

各公开包的正文与导航保存在自己的 docs 目录，通过 reactiveMp.docs 声明随包文档。docs/site.json 的 site 可指定承载它的公开包站点；Reactivity 声明由 reactive-mp 承载。Kit 文档站统一提供 Wechat 和 Images Preloader 的指南与 API，Store 保留独立站点，kit 提供其转发用法。apps/docs 共用构建与渲染，按实际站点生成导航、搜索索引和静态产物；被承载包的文档仍从自己的包目录读取，API、npm 身份及版本独立维护。工作区 docs 保留总入口与维护资料。根 README 提供项目入口，包 README 保留独立定位和最小有效接入。

API 参考从包的实际导出与模块化 index.d.ts 生成，检查缺失的声明和虚假的类型导出；详细语义由指南说明。代码片段使用 <<< 路径从开发宿主引用。修改公开行为时同步更新类型、指南、宿主与对应回归。

```sh
npm run docs:api
npm run docs:check
npm run docs:build
npm run docs:dev
npm run docs:build -- --package @reactive-mp/components
npm run docs:dev -- --package @reactive-mp/components
```

文档本地地址默认 http://127.0.0.1:4173。完整构建输出在 apps/docs/dist，各实际站点的独立产物位于其所属包的同名目录；指定包预览会解析到承载它的站点，并将该目录作为站点根。源码链接指向构建随附的源码页面。

## 贡献检查

npm run check 是统一检查入口。CI 使用锁文件安装，不需要个人 AppID 或密钥。包使用原始 ESM 和显式文件扩展名，宿主准备只处理包路径，不转换业务语义。新增包依赖必须保持单向，不能为方便而跨目录读取其他包未导出的文件。

消费者以各包 index.d.ts 为类型入口，生成的 vendor 与文档产物不作为独立实现修改。

## 维护规范

- [文档规范](documentation-standard.md)：正式合同、过程资料、来源同步和包的首次使用入口。
- [代码规范](code-standard.md)：书写、代码职责与文件组织。
- [代码检查与验收标准](code-review-standard.md)：按 L0—L7 组织审查条目、证据和结论。
- [开发宿主与验证](validation.md)：联调场景与验证方式。

## 计划与记录

- [重构计划](development-plan.md)
- [平台能力清单与实施计划](platform-coverage.md)
- [验证记录](verification.md)

这些资料服务实现与维护，不构成另一套使用合同；正式接口以指南与 API 参考为准。

## 代码与包体检查

根格式配置由 .prettierrc.json 和 .editorconfig 维护。npm run format:check 检查正式源码、工具和原生宿主；npm run format 在同一范围应用排版。测试、临时证据及生成内容不参与机械格式化。结构检查、类型、行为与实际平台验证仍分别执行。

包的 description、keywords、README 和实际 tarball 一起检查。统一入口的 reactive-mp-prepare 命令在 Node 中读取安装包的公开导出，准备原生 vendor；该工具与开发宿主使用同一实现，不进入小程序依赖图。生成目录必须由工具拥有，未知内容和符号链接会被拒绝。

开发宿主准备采用 staging 和工作区互斥目录，完成后切换 vendor，失败保留上一份产物。不要在准备或 watch 写入期间执行真实平台验收；中断遗留的 artifacts/examples-prepare.lock 只在确认没有准备进程时处理。

三份规范的全量审阅、修复映射和未验证边界见 [规范检查记录](standards-review.md)。代码清单由 `npm run code:check` 生成到 artifacts/code-inventory.json；该检查验证语法、模块说明和控制流格式，不能替代语义审阅。

## 文档站

正文、导航、品牌素材、构建和静态部署见[文档站维护](../apps/docs/README.md)；使用与维护入口统一登记在[文档索引](README.md)。
