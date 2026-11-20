# Requests and concurrency

## Request client

wxRequest retains the native response, accepts status 200–399 by default and supports validateStatus. createRequest(baseURL?, options?) creates independent defaults, query handling and asynchronous interceptors:

```js
import { createRequest } from '@reactive-mp/kit/wechat/network';

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

```js
async function recover(error, { retryHandle }) {
  if (!retryHandle) throw error;
  // 在此完成应用自己的恢复操作。
  const [ok, value] = await retryHandle();
  if (!ok) throw value;
  return value;
}
```

request(url,config?), get/delete(url,params?,config?) and post/put/patch(url,data?,config?) share URL processing. Relative URLs join baseURL; absolute URLs remain unchanged. All entries accept config.params. Header merging is case-insensitive. timeout defaults to 10000; explicit zero/false values are preserved. Client options use headers, while native wxRequest uses header.

## Interceptors and retries

Every interceptor awaits promises. onResponseResolve returns a business payload; throwing becomes a response failure. onResponseReject may recover by returning a payload, or keep failure by throwing. NetworkError._neterr is reqerr, reserr or cancelled; errTag preserves application classification and cause preserves the underlying reason.

Context contains final configuration and retryHandle. The first request offers one explicit retry; retry runs onRequest again but supplies no further retryHandle. retry=false disables it. The library does not refresh identity or retry automatically. retryHandle returns Result: unpack it and throw failures rather than returning the tuple as the business payload.

Clients return ordinary Result promises. Use wxRequest/wxUploadFile for native abort or upload progress. showNetErrMsg and showResponseErrMsg show messages only when explicitly invoked; the latter returns [true,false] for a non-response error.

## In-flight concurrency

| Wrapper | Contract |
| --- | --- |
| reusableGetter(caller,{key}?) | Same in-flight arguments share a Promise; completed values are not cached |
| debouncedGetter(caller,strictMode?,{key}?) | Duplicate in-flight calls return cancelled; strict mode locks the entire wrapper |
| debouncedSetter(caller,withForce?) | Locks the wrapper; optional force() uses a separate per-argument suppression channel |

These control concurrency rather than delaying by a timer. Callers return Result. Synchronous throws and rejected promises become NetworkError, and every terminal result releases the lock. Default JSON.stringify(args) keys can collide for values such as undefined; supply a custom key for non-JSON arguments. Isolate identities with different wrappers or identity-aware keys.

Platform legal-domain, AppID, networking and permission restrictions still apply. Internal error/query helpers are not public utilities.
