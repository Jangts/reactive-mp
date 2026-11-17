/** 月份网格和日期边界计算，日期按本地日历值比较。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useField } from './use-field.js';
import { withDefaults } from '../utils/properties.js';
const dateString = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
export function useCalendar(props = {}, options = {}) {
  const field = useField(withDefaults(props, { defaultValue: '' }), options);
  const now = new Date();
  const [month, setMonth] = useSignal(
    props.month ||
      field.value()?.slice(0, 7) ||
      dateString(now.getFullYear(), now.getMonth(), 1).slice(0, 7),
  );
  watch(
    () => props.month,
    (value) => {
      if (value) {
        setMonth(value);
      }
    },
  );
  watch(field.value, (value) => {
    if (value && !props.month) {
      setMonth(value.slice(0, 7));
    }
  });
  const days = computed(() => {
    const [year, monthNumber] = month().split('-').map(Number);
    const index = monthNumber - 1;
    const result = Array.from(
      { length: new Date(year, index, 1).getDay() },
      () => ({ value: '', day: '' }),
    );
    for (let day = 1; day <= new Date(year, index + 1, 0).getDate(); day++) {
      const value = dateString(year, index, day);
      result.push({
        value,
        day,
        disabled: !!(
          (props.min && value < props.min) ||
          (props.max && value > props.max) ||
          props.disabledDates?.includes(value) ||
          options.disabledDate?.(value)
        ),
        selected: field.value() === value,
      });
    }
    return result;
  });
  return {
    ...field,
    month,
    days,
    weekdays: computed(
      () => props.weekdays ?? ['日', '一', '二', '三', '四', '五', '六'],
    ),
    previousMonth: () => move(-1),
    nextMonth: () => move(1),
    onDay(event) {
      const day = days()[Number(event.currentTarget.dataset.index)];
      if (day?.value && !day.disabled) {
        field.commit(day.value);
      }
    },
  };
  function move(offset) {
    const [year, number] = month().split('-').map(Number);
    const date = new Date(year, number - 1 + offset, 1);
    const next = dateString(date.getFullYear(), date.getMonth(), 1).slice(0, 7);
    if (
      (props.min && next < props.min.slice(0, 7)) ||
      (props.max && next > props.max.slice(0, 7))
    ) {
      return;
    }
    setMonth(next);
    field.emit('monthchange', { month: next });
  }
}
