# Results, routing and native tasks

## Result and task ownership

Asynchronous wrappers return Promise<[true,T] | [false,WechatError]>. Storage wrappers return synchronous results. Native failures, synchronous host exceptions and parsing failures become error tuples without logging request bodies or credentials. Errors expose message, code, api and cause; HTTP failures also expose statusCode and data.

Pure formatRoute and synchronous query/component operations keep synchronous behavior and throw directly. Unknown business payloads remain unknown and declarations do not require global WeChat types.

wxRequest and wxUploadFile return promises with a read-only task. The caller owns abort/progress/header listeners. Aborting still waits for the native callback to settle.

## Login, permission and subscriptions

wxLogin returns a one-time code without exchanging or storing a business token. wxAuthorize checks the granted scope before authorization; failures do not automatically open settings or prompts. wxCheckSubscriptionsSetting returns settings: mainSwitch=false means disabled settings, not a failed query.

requestSubscriptionsNotification requests one template in the current call stack. Only accept is successful; other states produce SUBSCRIPTION_NOT_ACCEPTED with the native result in cause. Call it from an appropriate user gesture. Applications own messages and recovery UI.

## Routing, nodes and storage

Routing wrappers preserve native responses and eventChannel. createRouter uses explicitly supplied tabRoutes, never __wxConfig. navigateTo/redirectTo switch configured tab pages with switchTab. Explicit switchTab always uses that native method. Query parameters on a tab navigation fail instead of being dropped. Paths receive a leading slash; arrays repeat query keys, undefined is omitted and null becomes an empty string. Existing query text is preserved. formatRoute returns {url,path,query,isTabRoute}.

wxSelect exposes rect and data; component queries require a context supporting selectComponent. wxSelectAll.rects returns an empty successful array when nothing matches; a missing single node returns NODE_NOT_FOUND. Queries are scoped with native SelectorQuery.in and must run after rendering.

wxSelectEvt reads detail and currentTarget.dataset, returning the whole object when no key is supplied. getStorageItem distinguishes missing keys from stored 0, false, empty strings and null. Missing data produces STORAGE_NOT_FOUND; setStorageItem returns the original value on success. Native serialization and capacity limits remain.

## Images, uploading and prompts

wxChooseImage returns native tempFiles. wxGetImageInfo returns native image information. wxUploadFile requires explicit URL, file path and field name, accepts only 2xx responses and otherwise returns the native response unless parseResponse is provided. Parsing may be synchronous or asynchronous; parsing failure becomes an error tuple. Applications own authentication, business codes and payload schemas.

Complete request, routing and upload examples:

```js
import { wxRequest } from '@reactive-mp/kit/wechat/wx';

const call = wxRequest('https://api.example.com/items');
call.task?.abort();
const [ok, responseOrError] = await call;
```

```js
import { createRouter } from '@reactive-mp/kit/wechat/wx';

const router = createRouter({ tabRoutes: ['/pages/home/index'] });
await router.navigateTo('/pages/home/index'); // 使用 switchTab
await router.navigateTo({ path: '/pages/detail/index', query: { id: 1 } });
```

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

wxShowToast defaults icon to none and forwards other native options; an empty title fails. wxToastErrorMessage explicitly displays an error and is not automatically called by requests or permission operations.
