/** 原生选择与弹窗草稿；选择值与原生滚轮索引分开。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useField } from './use-field.js';
import { normalizeOptions, selectedLabels } from '../utils/selection.js';
import { clone, equal } from '../utils/value-path.js';
export function useSelect(props = {}, options = {}) {
  const field = useField(props, options);
  const [opened, setOpened] = useSignal(false);
  const [draft, setDraft] = useSignal([]);
  const kind = options.kind ?? 'select';
  const choices = computed(() =>
    normalizeOptions(kind === 'column' ? [] : props.options, props),
  );
  const columns = computed(() =>
    kind === 'column'
      ? (props.options ?? []).map((column) => normalizeOptions(column, props))
      : [],
  );
  const pickerValue = computed(() =>
    kind === 'column'
      ? columns().map((column, index) =>
          Math.max(
            0,
            column.findIndex((option) =>
              Object.is(option.value, field.value()?.[index]),
            ),
          ),
        )
      : kind === 'select'
        ? Math.max(
            0,
            choices().findIndex((option) =>
              Object.is(option.value, field.value()),
            ),
          )
        : field.value() || props.defaultPickerValue || '',
  );
  const display = computed(() =>
    kind === 'select'
      ? summary(
          selectedLabels(field.value(), choices(), props.multiple).filter(
            (label) => label !== '',
          ),
        )
      : kind === 'column'
        ? columns()
            .map(
              (column, index) =>
                column.find((option) =>
                  Object.is(option.value, field.value()?.[index]),
                )?.label ?? '',
            )
            .join(' / ')
        : Array.isArray(field.value())
          ? field.value().join(' / ')
          : (field.value() ?? ''),
  );
  function summary(labels) {
    return labels.length > 2
      ? `${labels.slice(0, 2).join('、')} +${labels.length - 2}`
      : labels.join('、');
  }
  function close(reason = 'cancel') {
    if (!opened()) {
      return;
    }
    setOpened(false);
    if (reason === 'cancel') {
      field.emit('cancel', { value: field.value() });
    }
    field.emit('close', { value: field.value(), reason });
  }
  watch([() => props.options, field.value], () => close('external'));
  return {
    ...field,
    opened,
    pickerValue,
    display,
    pickerRange: computed(() =>
      kind === 'column'
        ? columns().map((column) => column.map((option) => option.label))
        : choices().map((option) => option.label),
    ),
    popupOptions: computed(() =>
      choices().map((option) => ({
        ...option,
        checked: draft().includes(option.value),
      })),
    ),
    open() {
      if (field.fieldDisabled() || field.fieldReadonly()) {
        return;
      }
      setDraft(
        clone(
          props.multiple
            ? (field.value() ?? [])
            : field.value() == null
              ? []
              : [field.value()],
        ),
      );
      setOpened(true);
      field.emit('open', { value: field.value() });
    },
    close: () => close(),
    onDraft(event) {
      const option = choices()[Number(event.currentTarget.dataset.index)];
      if (!option || option.disabled) {
        return;
      }
      if (props.multiple) {
        setDraft(
          draft().includes(option.value)
            ? draft().filter((value) => !Object.is(value, option.value))
            : [...draft(), option.value],
        );
      } else {
        setDraft([option.value]);
      }
    },
    confirm() {
      field.commit(props.multiple ? draft() : draft()[0]);
      close('confirm');
    },
    onPickerCancel: () => field.emit('cancel', { value: field.value() }),
    onPickerChange(event) {
      const value = event.detail.value;
      if (kind === 'select') {
        const choice = choices()[Number(value)];
        if (choice && !choice.disabled) {
          field.commit(choice.value, 'change', {
            ...event.detail,
            selectedOptions: [choice.raw],
          });
        }
      } else if (kind === 'column') {
        const selected = value.map(
          (index, column) => columns()[column]?.[Number(index)],
        );
        if (selected.every((option) => option && !option.disabled)) {
          field.commit(selected.map((option) => option.value));
        }
      } else if (!equal(value, field.value())) {
        field.commit(value, 'change', { ...event.detail });
      }
    },
  };
}
