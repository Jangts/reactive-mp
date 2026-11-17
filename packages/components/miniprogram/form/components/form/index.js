/** form 原生组件入口，逻辑由组合 Hook 持有。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useForm } from '../../hooks/use-form.js';
import { formProperties } from '../../utils/properties.js';
defineComponent(({ defineProps, defineExpose }) => {
  const props = defineProps(formProperties);
  const form = useForm(props, { scope: true });
  const methods = Object.fromEntries(
    [
      'getValues',
      'getFieldState',
      'setFieldValue',
      'setValues',
      'setFieldError',
      'hideErrors',
      'validate',
      'submit',
      'reset',
      'setValidators',
      'setMessages',
      'setUploadAdapters',
    ].map((name) => [name, form[name]]),
  );
  defineExpose(methods);
  return { ...methods, formState: form.state };
});
