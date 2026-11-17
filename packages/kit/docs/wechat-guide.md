# 结果与原生 API

## 结果与任务

异步操作返回 `Promise<[true, T] | [false, WechatError]>`；缓存读写返回同步结果。原生失败、同步宿主异常和解析失败转换为失败结果，不打印请求体或凭证。error.message 为消息，code 为包装层分类，api 为原生入口，cause 保留原始对象。HTTP 错误额外提供 statusCode 和 data。

原生链式查询 wxQuerySelector/All、组件查询 component() 和纯解析 formatRoute() 保留同步调用，错误直接抛出。未知业务数据默认为 unknown，类型声明不依赖全局微信类型。

wxRequest 与 wxUploadFile 返回的 Promise 上有只读 task，可访问原生取消、响应头或上传进度接口。任务和监听归调用方管理，取消后仍等待原生回调结算。

```js
import { wxRequest } from '@reactive-mp/kit/wechat/wx';

const call = wxRequest('https://api.example.com/items');
call.task?.abort();
const [ok, responseOrError] = await call;
```

## 登录、授权和订阅

- wxLogin({ timeout }?) 返回一次性 code，不交换或缓存业务 token。
- wxAuthorize(scope) 查询已授予的 scope，必要时调用 authorize；失败不自动弹窗或打开设置。
- wxCheckSubscriptionsSetting() 返回订阅设置对象。mainSwitch 为 false 表示设置关闭，查询本身仍然成功；未提供的字段保持缺省。
- requestSubscriptionsNotification(tmplId) 在当前调用栈中请求单个模板。仅 accept 成功，其余状态返回 SUBSCRIPTION_NOT_ACCEPTED，原生结果保留在 cause。放在用户操作回调内调用，遵守微信交互和权限要求。

引导设置、提示文案和业务登录流程由应用决定。

## 路由、节点和缓存

wxNavigateTo、wxRedirectTo、wxSwitchTab、wxReLaunch、wxNavigateBack 对应原生方法，保留原生响应及 eventChannel。不读取 __wxConfig。需要自动识别 tab 页时创建独立路由器：

```js
import { createRouter } from '@reactive-mp/kit/wechat/wx';

const router = createRouter({ tabRoutes: ['/pages/home/index'] });
await router.navigateTo('/pages/home/index'); // 使用 switchTab
await router.navigateTo({ path: '/pages/detail/index', query: { id: 1 } });
```

navigateTo/redirectTo 对已配置 tab 页转用 switchTab；显式 switchTab 始终调用同名原生接口。tab 跳转含查询参数时返回失败，避免静默丢失。路径可省略前导斜线，输出统一补齐。查询数组重复 key，忽略 undefined，null 编为空串；原查询串保留。formatRoute(route, tabRoutes?) 返回 `{ url, path, query, isTabRoute }`。

wxSelect(selector, context?) 提供 rect() 和 data(key?)；组件查询需传入支持 selectComponent 的上下文后调用 component()。wxSelectAll(selector, context?).rects() 返回矩形数组，无匹配为成功空数组；单节点缺失返回 NODE_NOT_FOUND。上下文通过原生 SelectorQuery.in 限定，应在节点渲染完成后查询。

wxSelectEvt(event).detail(key?) 与 .data(key?) 读取 detail 与 currentTarget.dataset，省略 key 返回完整对象。getStorageItem(key) 通过缓存 keys 区分缺失与已存储的 0、false、空串和 null，缺失返回 STORAGE_NOT_FOUND。setStorageItem(key, data) 成功返回同一数据值；序列化与容量限制沿用微信规则。

## 图片、上传和提示

wxChooseImage(options?) 返回原生 tempFiles；wxGetImageInfo(src) 返回原生图片信息。wxUploadFile 要求显式配置上传地址、文件路径与字段名：

```js
import { wxUploadFile } from '@reactive-mp/kit/wechat/wx';

const [ok, uploaded] = await wxUploadFile({
  url: 'https://api.example.com/upload',
  filePath: '/temporary/image.jpg',
  name: 'file',
  header: { Authorization: 'Bearer your-token' },
  parseResponse(response) {
    return JSON.parse(response.data);
  },
});
```

上传仅接受 2xx，默认返回原生响应。parseResponse 可以同步或异步解析，抛错或拒绝转为失败；鉴权、业务码和数据结构由应用处理。

wxShowToast(string | options) 默认 icon 为 none，其余原生选项透传；空标题返回失败。wxToastErrorMessage(error, defaultMessage?) 显式展示错误消息，不被网络或权限操作自动调用。

