/** 原生开发宿主的 probe 场景，用于交互复现与核心包联调。 */
import {
  defineComponent,
  computed,
  inject,
  useSignal,
} from '../../vendor/reactive-mp/src/index.js';
defineComponent(
  ({ defineProps }) => {
    const props = defineProps();
    const parent = inject('counter', 0);
    const [local, setLocal] = useSignal(0);
    return {
      label: computed(
        () => `${props.title}: parent=${parent()}, local=${local()}`,
      ),
      add: () => setLocal(local() + 1),
    };
  },
  { properties: { title: String } },
);
