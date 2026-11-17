/** Checkbox、Switch 与选项组共享值协议，版式只影响视图。 */
import { computed, useSignal } from '@reactive-mp/reactivity';
import { useField } from './use-field.js';
import { normalizeOptions } from '../utils/selection.js';
export function useChoice(props = {}, options = {}) {
  const field = useField(props, options);
  const [expanded, setExpanded] = useSignal(false);
  const choices = computed(() =>
    normalizeOptions(props.options, props).map((option) => ({
      ...option,
      checked: options.multiple
        ? (field.value() ?? []).includes(option.value)
        : Object.is(field.value(), option.value),
    })),
  );
  return {
    ...field,
    expanded,
    choices,
    visibleChoices: computed(() =>
      props.collapseAfter > 0 && !expanded()
        ? choices().slice(0, props.collapseAfter)
        : choices(),
    ),
    canExpand: computed(
      () => props.collapseAfter > 0 && choices().length > props.collapseAfter,
    ),
    checked: computed(() => !!field.value()),
    toggleExpanded: () => setExpanded(!expanded()),
    onToggle: () => field.commit(!field.value()),
    onChoose(event) {
      const option = choices()[Number(event.currentTarget.dataset.index)];
      if (!option || option.disabled) {
        return;
      }
      const previous = field.value() ?? [];
      const value = options.multiple
        ? previous.includes(option.value)
          ? previous.filter((item) => !Object.is(item, option.value))
          : [...previous, option.value]
        : option.value;
      field.commit(value);
    },
  };
}
