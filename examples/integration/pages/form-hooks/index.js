/** 页面直接用 Hooks 驱动原生输入、跨字段规则和重复行。 */
import {
  definePage,
  computed,
  useSignal,
} from '../../vendor/reactive-mp/src/index.js';
import {
  useForm,
  useField,
  useFieldArray,
} from '../../vendor/components/miniprogram/form/index.js';
definePage(() => {
  const form = useForm({
    initialValues: { password: '', confirmation: '', rows: [] },
    rules: {
      password: [{ required: true, minLength: 3 }],
      confirmation: [
        {
          dependencies: ['password'],
          validator: (value, ctx) =>
            value === ctx.values.password || '两次内容不同',
        },
      ],
    },
  });
  const password = useField({ name: 'password' }, { form, validateOn: 'blur' });
  const confirmation = useField(
    { name: 'confirmation' },
    { form, validateOn: 'blur' },
  );
  const array = useFieldArray(form, 'rows');
  const [result, setResult] = useSignal('');
  return {
    password: password.value,
    passwordError: password.errorMessage,
    onPasswordInput: password.onInput,
    onPasswordBlur: password.onBlur,
    confirmation: confirmation.value,
    confirmationError: confirmation.errorMessage,
    onConfirmationInput: confirmation.onInput,
    onConfirmationBlur: confirmation.onBlur,
    rows: array.rows,
    meta: computed(() => form.state()),
    add: () => array.append({ text: '新行' }),
    remove: (event) => array.remove(Number(event.currentTarget.dataset.index)),
    move: () => array.move(0, array.rows().length - 1),
    reset: () => form.reset(),
    submit: form.handleSubmit((values) =>
      setResult(JSON.stringify(values, null, 2)),
    ),
    result,
  };
});
