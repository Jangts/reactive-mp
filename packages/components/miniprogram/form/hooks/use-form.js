/** 表单控制器的响应式装配：状态绑定、属性同步与宿主清理。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useCurrentInstance, onReady, onUnmounted } from '@reactive-mp/runtime';
import { createFormController } from '../utils/form-controller.js';
import { useFormRelations } from '../utils/relations.js';
export function useForm(input = {}, options = {}) {
  const instance = useCurrentInstance();
  const emit = (name, detail) => {
    if (instance) {
      (options.emit ?? instance.triggerEvent.bind(instance))(name, detail);
    }
  };
  const controller = createFormController(input, { ...options, emit });
  const [state, setState] = useSignal(controller.getState());
  const stop = controller.subscribe(setState);
  if (options.scope) {
    useFormRelations('form', { controller });
  }
  watch(
    () => [input.rules, input.disabled, input.readonly, input.submitting],
    () =>
      controller.configure({
        rules: input.rules,
        disabled: input.disabled,
        readonly: input.readonly,
        submitting: input.submitting,
      }),
  );
  watch(
    () => input.model,
    (value) => controller.syncModel(value),
  );
  onReady(() => {
    if (input.validateOnMount) {
      void controller.validate({ silent: true });
    }
  });
  onUnmounted(() => {
    stop();
    controller.dispose();
  });
  const bindings = Object.fromEntries(
    Object.keys(state()).map((key) => [key, computed(() => state()[key])]),
  );
  return { ...controller, ...bindings, state };
}
