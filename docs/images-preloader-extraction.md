# 图片预加载组件抽取记录

## 来源与依赖

来源为 `tiffany-crm-weapp/components/common/c-images-preloader`。

| 原模块 | 职责与消费者 | 通用包归属 |
| --- | --- | --- |
| c-images-preloader | 隐藏容器；loadImages 创建批次并统计 total/done/fail | components/images-preloader + utils/preloader |
| image-loader | 原生 image 加载、超时、请求复用、尺寸记录 | 直接由容器渲染 image；utils/image-pool 共享请求 |
| utils/util-image 的 initImagePool | 向业务工具暴露共享池 | 内部模块自有池，无需业务初始化 |
| getLoadedImageSizeByUrl | util-cms/local-widgets 的图片排版读取尺寸 | 保留同名公开函数 |
| utils/index | 聚合导出，也间接引入其他业务工具 | 删除该依赖，包只依赖 runtime/reactivity |

`downloadImage` 与预加载无依赖关系，不抽入。CMS、门店、预约、贺卡等调用方负责选择图片和区分必要／后台批次，通用组件不读取业务数据。实际调用主要等待 loadImages 的汇总结果，没有发现调用方显式传入 delay 或 timeout。

## 整理的行为

- 原批次与子组件一直追加，现仅保留活动图片；终态释放任务、定时器与原生节点。
- 原 Promise、resolver 和任务对象放入 data，现只把 `{ id, src }` 送入视图。
- 原池使用普通对象，现使用 Map，URL 不与对象原型键冲突。
- 同 URL 的批次和多个宿主共享进行中的请求。所有者离开时，其他宿主接手加载；每个等待者独立超时或取消。
- 使用单调递增节点 ID 隔离迟到事件，错误、超时和卸载均可结束等待并再次尝试。
- 成功尺寸缓存限定最近使用的 256 项，完整批次尺寸由 results 保留。

## 接入与差异

组件独立为 `@reactive-mp/images-preloader`，不加入核心统一入口的必装依赖。普通 Page 和 Reactive 页面均可使用原生组件，Reactive 页面也可直接使用 Hook。详细接线和合同见[包 README](../packages/images-preloader/README.md)。

业务迁移时，将 usingComponents 路径指向新包，原 `loadImages(images)` 调用和 `{ total, done, fail }` 读取方式可保留。尺寸查询改为从新包导入，不再调用 initImagePool。来源工程本身未在此次抽取中修改。

明确的行为差异：

- 汇总增加有序 results，区分 loaded/error/timeout/cancelled。
- delay 统一以当前宿主 ready 为边界；ready 后调用时立即启动。原实现将延迟阶段放在每个新建的子 image-loader 上。
- delay 不再隐式禁用 timeout。默认 timeout 仍为 0。
- 卸载会结算等待；超时且没有其他等待者时移除加载节点。原实现超时后可能继续后台加载。
- 尺寸缓存有容量上限；CMS 需要一批图片的全部尺寸时，应使用该批次 results，不能假定任意历史 URL 永久可查询。

## 验证边界

自动化用例覆盖批次计数、顺序、空项、去重、共享请求、尺寸查询、失败重试、超时隔离、所有权转移、迟到事件、卸载清理、Hook/Page 接入、公开类型及离线包体接入。integration 宿主增加 `pages/images-preloader/index`，用于验证真实 image 的加载、失败和节点生命周期。

Node 模拟事件不能证明隐藏 image 在开发者工具与真机中的加载时序、图片解码或微信自身缓存复用。平台验收需运行示例并观察真实 load/error；网络图片另需使用工程已配置的资源域名。

### 2026-11-17 执行结果

- 10 个新增专项用例通过，全库 80 个测试通过；公开类型检查通过。
- 格式、源码规范、宿主源码准备、文档链接/API 和文档站构建通过。
- 8 个工作区包在隔离的离线消费者中打包、安装并验证，包括新包的组件文件与源码准备后的入口。
- `npm run verify:images-preloader` 未进入场景检查：开发者工具自动化连接未建立，直接检查 CLI 回执得到 preparing 阶段“需要重新登录（code 10）”。失败回执为 `artifacts/images-preloader-live-verification.json`。模拟器真实加载与真机行为未验收。

### 2026-11-17 继续验收

- 再次检查 CLI，登录状态仍为 code 10，尚未进入真实 image 场景。
- 修正共享验收工具：CLI 退出码为 0 但输出 preparing 失败时，立即记录原始原因，不再等待 WebSocket 连接后误报连接失败。最新失败回执已记录“需要重新登录”。
- 新增对应的回归用例，启动失败、验收超时、CLI 零退出码错误三项工具回归通过。

### 2026-11-18 模拟器验收

- 用户恢复登录后，微信开发者工具 `2.02.2607171`、基础库 `3.8.10`、iPhone 12/13 (Pro) 模拟器中，六个功能场景全部通过：隐藏图片加载和尺寸、成功缓存、原生 error 清理、跨实例共享请求、卸载结算、卸载后由另一实例接手。
- 本地图片实际返回 `960 × 540`；重复项按输入计数。两个实例等待相同 URL 时活动节点数为 `[1, 0]`，完成后均归零。所有者卸载后，其结果为 cancelled，另一实例仍得到 loaded。
- 功能回执为 `artifacts/images-preloader-live-verification.json`。先前四个功能场景通过后，模拟器截图接口响应超时，该失败回执保留为 `artifacts/images-preloader-screenshot-failure.json`；截图改为显式 `--screenshot` 选项，不作为默认的非视觉功能验收步骤。
- 默认 `npm run verify:images-preloader` 已完成六场景并正常退出。修复运行时就绪检查失败后遗留连接的问题，避免重试成功后验收进程仍被旧连接占用。
- 组件与验收工具共 14 个相关回归通过。完整 `npm run check` 的格式、源码检查、93 项测试、类型与宿主准备通过；随后文档检查因工作区新加入的 `@reactive-mp/components/form` 尚无法解析而中断，该包未在此项验收中修改。
- 真机、实际网络域名与微信文件缓存淘汰后的表现未验收。
