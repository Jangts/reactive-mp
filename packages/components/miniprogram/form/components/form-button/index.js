/** form-button 原生组件入口，逻辑由组合 Hook 持有。 */
import { defineComponent, onUnmounted } from '@reactive-mp/runtime';
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useFormRelations } from '../../utils/relations.js';
defineComponent(({ defineProps }) => {
  const props = defineProps({
    action: { type: String, value: 'submit' },
    disabled: Boolean,
    requireValid: Boolean,
  });
  const links = useFormRelations('field', {});
  const [state, setState] = useSignal(null);
  let stop = () => {};
  watch(
    links.form,
    (context) => {
      stop();
      stop = context?.controller.subscribe(setState) ?? (() => {});
    },
    { immediate: true },
  );
  onUnmounted(() => stop());
  return {
    buttonDisabled: computed(
      () =>
        props.disabled ||
        !state()?.canSubmit ||
        (props.requireValid && !state()?.valid),
    ),
    buttonLoading: computed(() => !!state()?.submitting),
    onTap() {
      const form = links.form()?.controller;
      if (
        !form ||
        props.disabled ||
        !form.getState().canSubmit ||
        (props.requireValid && !form.getState().valid)
      ) {
        return;
      }
      if (props.action === 'reset') {
        form.reset();
      } else {
        void form.submit().catch(() => {});
      }
    },
  };
});
