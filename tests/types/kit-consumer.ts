import {
  defineStore, storeToRefs, wxLogin, useImagesPreloader,
  type ImagesPreloadReport, type Result,
} from '@reactive-mp/kit';
import defaultStore from '@reactive-mp/kit/store';
import directStore from '@reactive-mp/store';
import { useSignal } from '@reactive-mp/reactivity';
import { createRequest } from '@reactive-mp/kit/wechat/network';

const sameStore: typeof directStore = defaultStore;
const useCounter = defineStore('counter', () => {
  const [count, setCount] = useSignal(0);
  return { count, increment: () => setCount(count() + 1) };
});
const count: number = storeToRefs(useCounter()).count();
const loader = useImagesPreloader;
async function login() {
  const result: Result<string> = await wxLogin();
  if (result[0]) { const code: string = result[1]; return code; }
  return result[1].message;
}
function report(value: ImagesPreloadReport) { return value.results; }
// @ts-expect-error Store setup must return an object
defineStore('invalid', () => 1);
void [sameStore, count, loader, login, report, createRequest];
