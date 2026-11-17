/** FormItem 仅提供命名、规则、继承状态和可替换反馈区域。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { onUnmounted } from '@reactive-mp/runtime';
import { useFormRelations } from '../utils/relations.js';
export function useFormItem(props = {}) {
  const [revision, refresh] = useSignal(0);
  const context = {
    props,
    get controller() {
      return links.form()?.controller;
    },
  };
  const links = useFormRelations('item', context);
  let stop = () => {};
  watch(
    () => context.controller,
    (controller) => {
      stop();
      stop = controller?.subscribe(() => refresh(revision() + 1)) ?? (() => {});
    },
    { immediate: true },
  );
  onUnmounted(() => stop());
  const field = computed(() => {
    revision();
    return props.name
      ? context.controller?.getFieldState(props.name)
      : undefined;
  });
  return {
    itemError: computed(() => field()?.errorMessage ?? ''),
    itemRequired: computed(() => field()?.required ?? props.required ?? false),
    itemDisabled: computed(() => field()?.disabled ?? props.disabled ?? false),
  };
}
