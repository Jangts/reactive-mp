/** Select documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: 'bj',
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
      },
    ],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
