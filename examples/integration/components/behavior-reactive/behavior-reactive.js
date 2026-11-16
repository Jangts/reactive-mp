/** 组合式 Behavior 对照：复用相同原生 Behavior，读取平台合并后的属性。 */
import {
  defineComponent,
  computed,
} from '../../vendor/reactive-mp/src/index.js';
import { sharedBehavior } from '../behavior-shared.js';
defineComponent(({ defineProps, behaviors }) => {
  behaviors(sharedBehavior);
  const props = defineProps();
  return { label: computed(() => `count=${props.count}`) };
});
