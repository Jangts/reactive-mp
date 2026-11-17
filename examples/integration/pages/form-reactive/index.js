/** Reactive 页面使用同一套表单组件，只改变页面状态写法。 */
import {
  definePage,
  useSignal,
  onReady,
  useCurrentInstance,
} from '../../vendor/reactive-mp/src/index.js';
import { formExample } from '../form/example-data.js';
definePage(() => {
  const [model, setModel] = useSignal({ ...formExample.model });
  const [result, setResult] = useSignal('');
  const page = useCurrentInstance();
  onReady(() =>
    page.selectComponent('#form').setValidators({
      email: async (value) => !value || String(value).includes('@'),
    }),
  );
  return {
    model,
    result,
    rules: formExample.rules,
    options: formExample.options,
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) =>
      setResult(JSON.stringify(event.detail.values, null, 2)),
  };
});
