/** 原生开发宿主的 hello-world 场景，用于交互复现与核心包联调。 */
import {
  computed,
  defineComponent,
  useSetupApp,
} from '../../vendor/reactive-mp/src/index.js';

defineComponent(({ defineProps, observe }) => {
  const props = defineProps({
    name: String,
  });

  /** @type {UseSetupApp<AppDataAndMethod>} */
  const { userInfo } = useSetupApp();

  const greeting = computed(() => `Hello, ${props.name}!`, {});

  observe([() => props.name], (name) => console.log(name));
  return { greeting };
});
