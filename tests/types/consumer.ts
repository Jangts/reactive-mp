import { useSignal, computed, watch, defineComponent, definePage, defineStore, storeToRefs, reactive, ref, onShareAppMessage } from 'reactive-mp';
const [count, setCount] = useSignal(0);
setCount(1);
// @ts-expect-error Signal emitter must preserve its payload type
setCount('bad');
const double = computed(() => count() * 2);
watch([count, double] as const, ([a, b]) => { const n: number = a + b; void n; });
// @ts-expect-error computed value is readonly
double.value = 2;
const object = reactive({ list: [1] }); object.list.push(2);
const r = ref('hello'); r.value = 'world';
defineComponent(({ defineProps, $emit }) => {
  const props = defineProps({ title: String, step: { type: Number, value: 1 } });
  const title: string = props.title;
  const step: number = props.step;
  // @ts-expect-error props are readonly
  props.step = 2;
  return { title, step, submit: () => $emit('change', { title }) };
}, { options: { futureNativeOption: true } });
definePage(() => { onShareAppMessage(() => ({ title: 'share' })); return { count }; });
const useCounter = defineStore('counter', () => ({ count, increment: () => setCount(count() + 1) }));
const store = useCounter(); store.increment(); storeToRefs(store).count(); store.$dispose();
import { defineApp, onLaunch, onThemeChange, onBeforeDetach, useSignalCarrier } from 'reactive-mp';
defineApp(() => {
  onLaunch(options => { const path: string | undefined = options.path; void path; });
  onThemeChange(event => { const theme: 'dark' | 'light' = event.theme; void theme; });
  return { count };
}, { globalData: { staticValue: 0 } });
definePage(() => { onShareAppMessage(async () => ({ title: 'async share' })); });
defineComponent(({ defineProps }) => {
  const props = defineProps({ anything: null, made: { type: Object, default: () => ({ ok: true }) } });
  const unknownValue: unknown = props.anything; void unknownValue;
  onBeforeDetach(() => {});
  return {};
});
const [readonlyObject] = useSignalCarrier({ value: 1 });
const [, carrierEmitter] = useSignal(readonlyObject);
const absent: null = carrierEmitter; void absent;
