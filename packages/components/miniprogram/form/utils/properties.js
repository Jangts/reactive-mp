/** 表单、字段及版式的原生属性清单；值缺省与视图状态分开命名。 */
export const fieldProperties = {
  name: { type: null, value: '' },
  label: String,
  value: { type: null, value: null },
  defaultValue: { type: null, value: null },
  rules: { type: Array, value: [] },
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  active: { type: Boolean, value: true },
  preserve: { type: Boolean, value: true },
  validateOn: String,
  appearance: { type: String, value: 'plain' },
  placeholder: { type: String, value: '请选择' },
};
export const formProperties = {
  model: { type: Object, value: null },
  initialValues: { type: Object, value: {} },
  rules: { type: Object, value: {} },
  disabled: Boolean,
  readonly: Boolean,
  submitting: Boolean,
  validateOnMount: Boolean,
};
export const itemProperties = {
  name: { type: null, value: '' },
  label: String,
  rules: { type: Array, value: [] },
  disabled: Boolean,
  readonly: Boolean,
  active: { type: Boolean, value: true },
  required: Boolean,
  description: String,
  help: String,
  labelPlacement: { type: String, value: 'top' },
};
export const optionProperties = {
  options: { type: Array, value: [] },
  labelKey: { type: String, value: 'label' },
  valueKey: { type: String, value: 'value' },
  childrenKey: { type: String, value: 'children' },
  variant: { type: String, value: 'list' },
  collapseAfter: { type: Number, value: 0 },
  columns: { type: Number, value: 1 },
};

/** 为 Hook 保留原输入的 getter，只为缺省项提供稳定值。 */
export function withDefaults(input, defaults) {
  return new Proxy(input, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver) ?? defaults[key];
    },
  });
}
