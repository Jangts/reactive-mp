/** 单组件内混写：原生 data/methods/lifetimes 与 setup 的 Signal 共用真实实例。 */
import {
  defineComponent,
  useSignal,
  computed,
  onMounted,
  onUnmounted,
} from '../../vendor/reactive-mp/src/index.js';
defineComponent(
  ({ defineProps, $emit }) => {
    const props = defineProps();
    const [count, setCount] = useSignal(0);
    onMounted(() => {
      getApp().globalData.mixedActive++;
    });
    onUnmounted(() => {
      getApp().globalData.mixedActive--;
    });
    return {
      count,
      label: computed(() => `${props.prefix}:${count()}`),
      incrementReactive: () => {
        setCount(count() + 1);
        $emit('change', { value: count() });
      },
    };
  },
  {
    properties: { prefix: { type: String, value: 'mixed' } },
    data: { vanilla: 0, readyCount: 0 },
    lifetimes: {
      ready() {
        this.setData({ readyCount: this.data.readyCount + 1 });
      },
    },
    methods: {
      incrementRaw() {
        this.setData({
          count: this.data.count + 1,
          vanilla: this.data.vanilla + 1,
        });
        this.triggerEvent('change', { value: this.data.count });
      },
    },
  },
);
