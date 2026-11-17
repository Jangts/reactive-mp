/** 可枚举选项的规范化与值映射，保留数字零和空串。 */
export function normalizeOptions(options = [], props = {}) {
  return options.map((option, index) =>
    typeof option === 'object' && option !== null
      ? {
          label: String(option[props.labelKey || 'label'] ?? ''),
          value: option[props.valueKey || 'value'],
          disabled: !!option.disabled,
          raw: option,
          index,
        }
      : {
          label: String(option),
          value: option,
          disabled: false,
          raw: option,
          index,
        },
  );
}
export function selectedLabels(value, options, multiple = false) {
  const values = multiple ? (value ?? []) : [value];
  return values.map(
    (item) =>
      options.find((option) => Object.is(option.value, item))?.label ??
      String(item ?? ''),
  );
}
