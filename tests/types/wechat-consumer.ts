import {
  wxLogin, wxRequest, wxUploadFile, wxSelect, wxSelectAll, wxSelectEvt,
  createRouter, createRequest, reusableGetter, debouncedSetter,
  getStorageItem, type Result, WechatError, type RequestResponse,
} from '@reactive-mp/kit/wechat';
import { wxNavigateTo } from '@reactive-mp/kit/wechat/wx';
import { isNetworkError, createRequest as createNetworkRequest } from '@reactive-mp/kit/wechat/network';

async function consume() {
  const login = await wxLogin();
  if (login[0]) { const code: string = login[1]; console.log(code); }
  else { const error: WechatError = login[1]; console.log(error.code); }
  const native = wxRequest<{count: number}>('https://example.test', {data: false});
  native.task?.abort();
  const response = await native;
  if (response[0]) {const count: number = response[1].data.count; console.log(count);}
  const upload = wxUploadFile({url: 'https://upload.test', filePath: 'tmp', name: 'file', parseResponse: async () => 42});
  upload.task?.onProgressUpdate(({progress}) => console.log(progress));
  const uploaded = await upload;
  if (uploaded[0]) { const id: number = uploaded[1]; console.log(id); }
  const router = createRouter({tabRoutes: ['pages/home'] as const});
  await router.navigateTo({path: '/pages/item', query: {id: 1, values: [false, null]}});
  await wxNavigateTo('/pages/item');
  const selection = wxSelect('#item', {selectComponent: () => ({id: 1})});
  const component = selection.component<{id: number}>();
  const rects = await wxSelectAll('.item').rects();
  if (rects[0]) {const width: number | undefined = rects[1][0]?.width; console.log(width);}
  const value: boolean | undefined = wxSelectEvt({detail: {value: false}}).detail('value');
  const stored = getStorageItem<boolean>('flag');
  if (stored[0]) {const flag: boolean = stored[1]; console.log(flag);}
  const client = createRequest<{id: number}>('https://example.test', {interceptors: {
    async onRequest(config) {config.headers.Authorization = 'Bearer example'; return config;},
    async onResponseResolve() {return {id: 1};},
    async onResponseReject(error, {retryHandle}) {
      if (retryHandle) {
        const [ok, value] = await retryHandle();
        if (ok) {return value;}
      }
      throw error;
    },
  }});
  const result = await client.get('/item', {id: 1});
  if (result[0]) {const id: number = result[1].id; console.log(id);}
  else if (isNetworkError(result[1])) {console.log(result[1]._neterr);}
  const raw: Result<RequestResponse> = await createNetworkRequest()('/item');
  const deduped = reusableGetter(async (id: number): Promise<Result<number>> => [true, id]);
  const guarded = debouncedSetter(deduped, true);
  await guarded.force(1);
  // @ts-expect-error native timeout is a number
  wxRequest('/item', {timeout: '1000'});
  // @ts-expect-error upload requires an explicit destination
  wxUploadFile({filePath: 'tmp', name: 'file'});
  // @ts-expect-error query parameters must be serializable scalar values
  router.navigateTo({path: '/item', query: {x: {id: 1}}});
  // @ts-expect-error the wrapper preserves caller argument types
  deduped('1');
  // @ts-expect-error component selection requires a selecting host
  wxSelect('#item').component();
  console.log(component, value, raw);
}
void consume;
