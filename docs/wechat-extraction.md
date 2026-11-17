# 微信 API 封装抽取记录

## 来源和范围

来源为 hublot-mc/webapp/app/package-member-center/lib 中的 wx 与 network。原工程未迁移调用；form、store、EventBus、业务校验和 utils 未纳入。包使用内部错误桥接和查询串编码，无运行时依赖。

| 来源 | 新归属与整理 |
| --- | --- |
| wx/auth | 登录、scope 授权和订阅；移除默认弹窗与异步订阅预检 |
| wx/dom | 节点、矩形和事件读取；修复多节点 ctx 缺失，统一显式上下文 |
| wx/router | 原生导航和 createRouter；移除 __wxConfig，修复 tab 路径比较 |
| wx/storage | 区分缺失与已保存的假值 |
| wx/file | 选图、图片信息、上传；移除业务地址、TOKEN 和固定响应码 |
| wx/request | 原生请求、HTTP 状态判定和原生 task |
| wx/toast | 显式提示，保留 duration 等显式假值 |
| network | 请求实例、阶段错误与并发控制；等待异步拦截器，异常终态释放 |

## 接入差异

- 失败为 WechatError/NetworkError，原生原因在 cause。路由参数错误返回失败 Result，纯 formatRoute 仍抛错。
- 路由成功保留原生结果及 eventChannel；formatRoute.path 保留前导斜线。自动 tab 识别需 createRouter({ tabRoutes })。
- wxUploadFile 使用显式配置对象，业务解析由 parseResponse 提供并等待异步结果。
- wxCheckSubscriptionsSetting 返回设置对象，关闭总开关不表示查询失败。订阅请求仅 accept 成功，不自动弹窗。
- 客户端所有入口统一处理 URL 并等待拦截器。retryHandle 返回 Result，应用须解包后返回 payload。
- 请求复用只在同一包装函数内进行，完成不缓存；拒绝和抛错释放占用。debounced 名称保留，但语义为进行中抑制，非定时防抖。
- 包不加入 reactive-mp 核心必装依赖。原生准备工具增加 --package，可独立准备可选包。

## 验证边界

tests/wechat.test.mjs 验证回调、异常、缓存、节点、路由、上传、异步拦截器、显式重试和并发释放。类型消费者为 tests/types/wechat-consumer.ts。实际包体检查覆盖隔离离线安装、公开子入口、无 wx 环境导入及只准备 wechat 的原生依赖闭包。

integration 的 pages/wechat/index 以普通 Page 演示缓存、节点、登录、选图、提示、请求和取消。Node 模拟不证明平台权限、用户手势、真实节点测量、网络或微信 npm 构建效果。订阅模板和上传需消费工程提供真实配置。

2026-11-18（Asia/Shanghai）实际运行 verify:wechat-api，在基础库 3.8.10 / devtools 通过三项：0、false、空串缓存往返；普通 Page 的上下文节点查询（probe 矩形 366 × 46.5）；原生 showToast 成功回调。errors 为空，回执为 artifacts/wechat-api-live-verification.json，开始时间 2026-11-17T16:05:52.213Z，源码摘要为 3017bc40680e154ca7738654b8150c774b6a40753f3018cc7de6d4aa25d81ac5。首次沙箱执行因本地端口 EPERM 失败，经工具授权执行后通过。

该结果不覆盖登录、授权、选图、订阅、上传、真实网络请求、微信 npm 构建或实机。自动化测试覆盖相关适配逻辑，不等于这些能力已经平台验收。

正式用法以[包 README](../packages/wechat/README.md)和生成 API 参考为准。
