# 开发宿主与验证

examples 直接参与包开发，不只是发布后的演示。每个目录都是独立原生小程序工程，当前工作区的实现通过统一命令准备到 vendor。

| 宿主 | 用途 | 检查重点 |
| --- | --- | --- |
| playground | 迁移原有实验工程，持续联调和探索 | 原有 Hook、组件、原生 API 兼容；历史实验不等同于通过验收 |
| integration | 确定性的核心平台回归 | 状态与派生值、多实例、注入、生命周期、原生混用、分享返回值 |
| scenarios | 真实组合场景 | 购物车共享 Store、页面反复进入退出、状态共享与清理 |

## 日常流程

```sh
npm run examples:prepare
npm run dev
npm test
npm run typecheck
npm run check
```

打开 integration：增加后 count 加一、double 始终是其两倍；两个 probe 的 parent 相同，点击单个 probe 只改变自己的 local。重置使父计数归零。退出页面后 active pages 控制台计数应归零。验证原生 ready 与 Hook 均执行。

打开 scenarios：加购后打开第二个页面实例，两处共享数量和金额；返回前一页后状态继续一致。清空后数量与金额归零。

分享的完整表现依赖真实 AppID、登录状态和平台能力；touristappid 下不能把权限限制判为库故障。

## 测试层次

- Node：直接加载真实工作区包，模拟必要平台入口，验证状态、作用域、配置收集、生命周期转发和实例隔离。
- 类型：以消费者导入为入口，包含预期的非法写入和类型错误，检查声明是否与用法一致。
- 产物：准备宿主后加载相对导入版本，检查包边界、vendor 解析及无运行配置进入 data。
- 微信开发者工具：验证真实注册、数据序列化、WXML 事件、属性更新及生命周期顺序。
- 实机：需要 AppID/平台权限时单独记录，不以 mock 替代。

新增问题先加入最小复现，必要时补自动化测试。平台验证记录放在 [验证记录](verification.md)，只记录实际执行结果。

本地工具自动化入口：npm run verify:wechat -- integration。可以通过 WECHAT_CLI 指定工具路径，或通过 WECHAT_WS_ENDPOINT 连接已打开的正确宿主；宿主身份必须匹配。--screenshot 额外请求截图，部分工具版本可能不响应该接口。
