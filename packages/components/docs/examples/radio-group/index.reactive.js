/** RadioGroup documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: 0,
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    options: [
      {
        label: 'Beijing',
        value: 0,
      },
      {
        label: 'Shanghai',
        value: 1,
      },
      {
        label: 'Guangzhou',
        value: 2,
      },
    ],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
