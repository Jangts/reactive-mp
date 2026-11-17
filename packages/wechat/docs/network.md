# 请求与并发控制

## 请求客户端

wxRequest(url, options?) 保留原生 response，默认接受 200–399，可通过 validateStatus 修改。createRequest(baseURL?, options?) 提供独立默认配置、查询参数和异步拦截器：

```js
import { createRequest } from '@reactive-mp/wechat/network';

const request = createRequest('https://api.example.com', {
  timeout: 10000,
  interceptors: {
    async onRequest(config) {
      // 可修改或返回完整配置，包括 url、headers、method 和 data。
      return config;
    },
    async onResponseResolve(response) {
      return response.data;
    },
  },
});
const [ok, dataOrError] = await request.get('/items', { page: 1 });
```

直接 request(url, config?)、get/delete(url, params?, config?) 和 post/put/patch(url, data?, config?) 共用 URL 处理。相对地址拼接 baseURL，绝对地址保留，所有入口接受 config.params。请求头不区分大小写合并；timeout 默认 10000，显式 0/false 参数保留。客户端配置用 headers，原生 wxRequest 用 header。

所有拦截器均等待 Promise。onResponseResolve(response, context) 返回业务 payload，抛错转为响应失败；onResponseReject(error, context) 返回 payload 表示恢复成功，继续失败需抛错。NetworkError._neterr 为 reqerr、reserr 或 cancelled；errTag 保留应用自定义标记，cause 保留底层原因。

context 包含最终配置和 retryHandle。首次请求提供一次重试入口，重试重新运行 onRequest，但不再提供 retryHandle；config.retry 为 false 时禁用。库不自动刷新身份或重试。retryHandle 返回 Result，拦截器须解包：

```js
async function recover(error, { retryHandle }) {
  if (!retryHandle) throw error;
  // 在此完成应用自己的恢复操作。
  const [ok, value] = await retryHandle();
  if (!ok) throw value;
  return value;
}
```

客户端返回普通 Result Promise。需要原生取消或上传进度时使用 wxRequest/wxUploadFile。showNetErrMsg 与 showResponseErrMsg 仅显式调用时提示；后者遇到非响应错误返回 `[true, false]`。

## 进行中请求控制

- reusableGetter(caller, { key }?)：同一包装函数内，相同参数的进行中调用共享 Promise，终态释放，不缓存结果。
- debouncedGetter(caller, strictMode?, { key }?)：重复进行中调用返回 cancelled；strictMode 为 true 时整个包装函数互斥。
- debouncedSetter(caller, withForce?)：整个包装函数互斥；启用 withForce 后 .force() 使用独立的按参数抑制通道，未启用时返回失败。

这些是并发控制，不是按时间延迟的防抖。caller 返回 Result，同步抛错和 Promise 拒绝转换为 NetworkError，所有终态释放占用。默认 key 为 JSON.stringify(args)，适合 JSON 参数，undefined 等值可能碰撞；非 JSON 参数应提供自定义 key。多个业务身份使用独立包装函数，或将身份纳入 key。

## 平台前提与目录

src/wx 为原生封装，src/network 为请求增强。内部错误桥接和查询串不作为公共工具导出；表单、Store、事件总线与业务校验不属于本包。

请求与上传仍受合法域名、AppID、网络和微信权限约束。原生接口见[微信官方 API 文档](https://developers.weixin.qq.com/miniprogram/dev/api/)，包不绕过平台限制。
