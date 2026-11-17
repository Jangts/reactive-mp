/** 重复行的稳定身份与路径重排；数组事务拥有删除语义。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { onUnmounted } from '@reactive-mp/runtime';
import { getValue, toPath, equal } from '../utils/value-path.js';
export function useFieldArray(form, path, options = {}) {
  const parts = toPath(path);
  let sequence = 0;
  let keys = [];
  let expected;
  const [rows, setRows] = useSignal([]);
  const update = (values) => {
    const list = getValue(values, parts) ?? [];
    if (options.itemKey) {
      const ids = list.map((value) => value[options.itemKey]);
      if (ids.some((id) => id == null) || new Set(ids).size !== ids.length) {
        throw new Error('FieldArray itemKey must be unique');
      }
      keys = ids.map((id) => `${typeof id}:${id}`);
    } else if (!equal(list, expected)) {
      keys = list.map(() => `row-${++sequence}`);
    }
    expected = list;
    setRows(
      list.map((value, index) => ({
        key: keys[index],
        index,
        path: [...parts, index],
        value,
      })),
    );
  };
  const stop = form.subscribe((state) => update(state.values));
  function replace(list, nextKeys, indices) {
    keys = nextKeys ?? list.map(() => `row-${++sequence}`);
    expected = list;
    if (indices) {
      form.reorderArray(parts, list, indices);
    } else {
      form.setFieldValue(parts, list, 'array');
    }
    update(form.getValues());
  }
  onUnmounted(stop);
  return {
    rows: computed(rows),
    append(value) {
      const list = getValue(form.getValues(), parts) ?? [];
      replace(
        [...list, value],
        [...keys, `row-${++sequence}`],
        [...list.map((_, index) => index), -1],
      );
    },
    remove(index) {
      const list = [...(getValue(form.getValues(), parts) ?? [])];
      if (index < 0 || index >= list.length) {
        return;
      }
      list.splice(index, 1);
      const next = [...keys];
      next.splice(index, 1);
      replace(
        list,
        next,
        list.map((_, position) => (position < index ? position : position + 1)),
      );
    },
    move(from, to) {
      const list = [...(getValue(form.getValues(), parts) ?? [])];
      if (from < 0 || to < 0 || from >= list.length || to >= list.length) {
        return;
      }
      const next = [...keys];
      list.splice(to, 0, list.splice(from, 1)[0]);
      next.splice(to, 0, next.splice(from, 1)[0]);
      const indices = list.map((_, index) => index);
      indices.splice(to, 0, indices.splice(from, 1)[0]);
      replace(list, next, indices);
    },
    replace: (list) => replace(list),
  };
}
