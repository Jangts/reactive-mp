/** Checkbox documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: false,
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    rules: {
      value: [
        {
          accepted: true,
          message: 'Please accept',
        },
      ],
    },
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
