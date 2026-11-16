# 验证记录

日期：2026-11-12。本记录区分实际通过、工具限制与尚未执行。

## 本地自动化

- 37 项 Node 回归：通过。直接加载工作区包及宿主准备后的相对导入模块。
- 消费者 TypeScript 类型检查：通过，包括预期非法用法的错误断言。
- 文档导航、内部链接、源码引用、API 导出与签名一致性检查：通过。
- 16 页文档站构建：通过，源码链接随构建自包含。
- 五个 npm 包打包，在独立临时工程中离线安装、导入、注册组件并验证响应式与 Store：通过。
- 统一格式检查与 83 个生产模块的语法、说明头、控制流代码块检查：通过。源码清单为 artifacts/code-inventory.json。
- 独立消费者中运行包内原生准备工具并加载生成模块：通过。
- git diff --check：通过。

本次三规范检查的发现、修复映射及未闭合验收边界见 [规范检查记录](standards-review.md)。

复现完整本地验证：npm run check。微信自动化不作为无图形环境 CI 的前置条件。

## 微信开发者工具

本机工具版本 2.02.2607171，实际基础库版本 3.8.10。integration 在 touristappid 环境下实际通过：

1. 初始页面数据和渲染值。
2. 原生 WXML 点击事件、Signal 更新和 computed 结果。
3. 父级注入，以及两个组件实例的本地状态隔离。
4. 原生 setData 修改状态后同步派生值。
5. 直接调用页面分享回调得到正确返回值；这不代表真实分享权限验证。

原始功能结果保存于本地 artifacts/integration-functional.json；artifacts 不提交。上述平台运行发生于本轮重构过程中，不表示所有后续边界修复均已逐项重跑。

## 本次规范修复后的微信复验

已重新准备当前源码，并运行 `npm run verify:wechat -- integration`。受限环境首次启动本地服务出现 EPERM；在允许本机服务的执行环境重试后，CLI 返回，但 automator 无法连接 ws://127.0.0.1:9420。未获得本次修复后的功能通过结果。失败回执保存为 artifacts/integration-failure.json，历史平台结果仅作为历史证据保留。

## 工具限制与未验证项

- 官方 automator 的版本检查依赖 Tool.getInfo.SDKVersion，但当前工具只返回自身 version。验证器改为从运行时读取实际 SDKVersion，仍检查最低版本，没有跳过版本验证。
- 功能检查后的截图接口超时，未获得可用截图；截图现为 --screenshot 可选项。
- 切换到 scenarios 时，本机工具的自动化端口未稳定对应目标项目，遇到错误宿主或连接失败。验证器已加宿主身份核对，避免把别的工程结果当作通过。跨页面 Store 已通过 Node 回归，尚未通过本次真实工具验证。
- playground 的完整历史实验、Component 注册页面的真实运行、真实 AppID 分享权限与实机：尚未完成本轮平台验证。对应源码及 Node 覆盖不代替平台记录。
- 安装微信官方自动化开发依赖时，npm 报告了上游依赖漏洞。本次没有向 registry 发送额外依赖树执行 npm audit；用户选择暂不发送。这些工具仅是开发依赖，发布的五个运行时包没有外部运行依赖。

需要复核平台场景时，先 npm run examples:prepare，在工具中打开正确宿主，再运行 npm run verify:wechat -- integration 或 scenarios。若当前工具已提供可用端口，可指定 WECHAT_WS_ENDPOINT；验证器会核对宿主身份。工具必须开放本地自动化服务。


## 平台计划审计修订实施（2026-11-12）

本轮 `npm run check` 通过：41 项 Node 回归、消费者类型、格式/源码结构、三个宿主准备、文档检查与构建、五包独立离线消费。新增结构漂移失败清理、缺失 WeakRef 的前置诊断、最终定义属性默认值协调回归。源码检查覆盖 86 个生产模块。

平台重试先遇到 CLI 本地服务 EPERM；在允许本地端口的执行环境重试后，CLI 返回但初次 automator 连接失败。待 9420 确认监听后直接连接，WebSocket 握手成功，automator 协议请求仍超时。没有取得本轮功能通过结果。失败回执为 artifacts/integration-failure.json，包含 startedAt、sourceDigest、environment、checks/errors；未取得系统信息时 environment 为 null，不能借用旧环境信息补填。

当前验收门槛仍未关闭：恢复工具协议请求 → 核对实际宿主/基础库/组件框架/渲染后端 → 执行原生对照场景 → 实机。REG-01 和 ENV-02 的本地机制已实施；EXT-01 目前仅协调最终 properties/options，过滤器替换回调和嵌套 Behavior 合并仍待实现/对照。defineBehavior、动态过滤器入口、完整资源工具、分包及扩展矩阵尚未实施完毕。


## BEH-01 续实施（2026-11-12）

已实现平台合并属性的实例读取和内部通配 observer 同步；新增继承属性更新、两个实例隔离、销毁后迟到通知回归。integration 新增 pages/behavior/index 原生对照页，复用同一嵌套 Behavior，比较过滤器默认值、继承方法和实例隔离；verify:wechat integration 已纳入断言。

本轮真实连接恢复，读取 SDKVersion=3.8.10、platform=devtools；检测到 AggregateError 不存在。上一轮将其列为强制注册条件过严，已改为 shared 的 CombinedError 库内兼容实现，保持 errors 列表且不修改全局；五个错误聚合使用点统一接入，Store 补齐 shared 依赖。新增无原生 AggregateError 回归。

`npm run check` 全部通过：43 项 Node 回归、消费者类型、格式和 91 个源码模块、宿主准备、文档、五包独立消费。平台连接后的 reset 方法缺失仍需复核，不能将 Node 通过视为新增对照页的平台通过。失败回执保留在 artifacts/integration-failure.json。


### 当前源码平台复验通过

重开 integration 并在端口就绪后连接成功。`WECHAT_WS_ENDPOINT=ws://127.0.0.1:9420 npm run verify:wechat -- integration` 实际通过六项：初始渲染、WXML/派生值、祖先注入/实例隔离、setData 反馈、直接调用分享返回值，以及 BEH-01/EXT-01 原生对照（嵌套 Behavior、过滤后属性默认值、继承方法、实例隔离）。运行环境为基础库 3.8.10 / devtools；不是实机或真实分享权限验收。

回执：artifacts/integration.json；开始时间 2026-11-12T03:11:19.633Z；源码及宿主摘要 `61278b1a172a855ff110429eb19e6945354aad3c1523b4334b15fcce0713e205`。该次执行 errors 为空。后续源码改变需重跑；本结果不覆盖过滤器替换生命周期/observer、完整合并顺序及类型推导。验证器已加入连接阶段的有界重试和强制 reLaunch，功能断言不重试。


## MIX-01—04 混用场景实施（2026-11-12）

integration 增加 pages/mixed（definePage 内原生与 reactive 混用）、pages/vanilla（原生 Page）、mixed-counter（组件内部混用）、vanilla-counter（普通组件）及 vanilla-wrapper（普通容器内嵌组合式组件）。首页有入口。验证器检查原生 setData/Signal/computed、父级属性、两种事件出口、ready 与 Hook、组件卸载重建、双向导航及最终 active 归零。

基于这些场景简化两个路径：无 setup 的 Page/Component 定义直接原生注册；增强实例中不触及 Signal 根字段的 setData 直接沿用平台回调路径。Node 回归覆盖无 setup 定义不改写回调/不注入 Behavior，以及原生字段回调身份、混合提交同步和销毁后拒绝写入。

本地 `npm run check` 通过 45 项 Node 回归、消费者类型、97 个源码模块、格式、宿主准备、文档和独立打包消费。平台测试与宿主准备必须串行，重新生成 vendor 会触发工具热重载，中断正在执行的场景。页面跳转和逐次返回均等待目标路由实际到达，不通过重复执行业务动作消除失败。


MIX-01—04 当前源码平台验收通过：基础库 3.8.10 / devtools，共十项检查（原有六项加四项混用检查），errors 为空。两页均通过原生与 reactive 状态、props、事件、原生容器嵌套和重建检查；双向导航后逐页返回，mixedActive 恢复进入场景前的值。回执 artifacts/integration.json，开始时间 2026-11-12T03:32:49.664Z，源码及宿主摘要 `d65f23147fd7eb8b340223d046c816c7b8c84626a10054b1a183b8a04f816b67`。本结果不代表实机或完整平台能力验收。
