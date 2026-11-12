# 架构与贡献

## 包边界

| 包 | 责任 | 依赖 |
| --- | --- | --- |
| @reactive-mp/shared | 事件总线、微任务调度、通用工具 | 无 |
| @reactive-mp/reactivity | Signal、computed、watch、对象代理和作用域 | shared |
| @reactive-mp/store | 惰性共享状态与独立生命周期 | reactivity |
| @reactive-mp/runtime | setup 收集、实例连接、平台适配和小程序 Hook | shared / reactivity |
| reactive-mp | 用户统一入口 | 以上四包 |

reactivity 与 store 不认识 wx。runtime 只在注册 API 被调用时接触 Page/Component/Behavior，不在导入包时注册平台监听。lib/index.js 是兼容的统一入口，不包含另一份实现。

生命周期和平台事件以 runtime 的 constants 声明表为基础，集中驱动转发。上下文进入和恢复由 RuntimeContext 的作用域方法维护；注册配置由闭包持有，不写入 data。实例作用域拥有订阅与清理任务。

## 文档维护

文档正文只保存在 docs。apps/docs 管理导航和渲染，支持桌面及窄屏布局。根 README 提供项目入口；包 README 提供独立定位与最小有效接入，不复制整份教程。

API 参考从包的实际导出与模块化 index.d.ts 生成，检查缺失的声明和虚假的类型导出；详细语义由指南说明。代码片段使用 <<< 路径从开发宿主引用。修改公开行为时同步更新类型、指南、宿主与对应回归。

```sh
npm run docs:api
npm run docs:check
npm run docs:build
npm run docs:dev
```

文档本地地址默认 http://127.0.0.1:4173。源码链接指向构建随附的源码页面，公开托管和 npm 发布另行执行。

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
