/** 树状级联的路径草稿与延迟子级请求，业务只提供 options。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useField } from './use-field.js';
import { normalizeOptions } from '../utils/selection.js';
export function useCascader(props = {}, options = {}) {
  const field = useField(props, options);
  const [opened, setOpened] = useSignal(false);
  const [draft, setDraft] = useSignal([]);
  const [level, setLevel] = useSignal(0);
  function branch(path) {
    let source = props.options ?? [];
    const labels = [];
    let last;
    for (const value of path) {
      last = normalizeOptions(source, props).find((option) =>
        Object.is(option.value, value),
      );
      if (!last) {
        return { source: [], labels, complete: false };
      }
      labels.push(last.label);
      source = last.raw[props.childrenKey || 'children'];
    }
    return {
      source,
      labels,
      last,
      complete: Array.isArray(source) && source.length === 0,
    };
  }
  watch(field.value, () => {
    setOpened(false);
  });
  return {
    ...field,
    opened,
    display: computed(() => branch(field.value() ?? []).labels.join(' / ')),
    levels: computed(() => branch(draft()).labels),
    loading: computed(
      () => branch(draft().slice(0, level())).source === undefined,
    ),
    cascadeOptions: computed(() =>
      normalizeOptions(branch(draft().slice(0, level())).source ?? [], props),
    ),
    open() {
      if (!field.fieldDisabled() && !field.fieldReadonly()) {
        setDraft([...(field.value() ?? [])]);
        setLevel(0);
        setOpened(true);
      }
    },
    close: () => setOpened(false),
    onLevel: (event) => setLevel(Number(event.currentTarget.dataset.index)),
    onCascadeChoose(event) {
      const source = branch(draft().slice(0, level())).source ?? [];
      const option = normalizeOptions(source, props)[
        Number(event.currentTarget.dataset.index)
      ];
      if (!option || option.disabled) {
        return;
      }
      const path = [...draft().slice(0, level()), option.value];
      setDraft(path);
      const children = option.raw[props.childrenKey || 'children'];
      if (children === undefined) {
        setLevel(path.length);
        field.emit('loadchildren', { path, option: option.raw });
      } else if (children.length) {
        setLevel(path.length);
      } else {
        field.commit(path);
        setOpened(false);
      }
    },
  };
}
