/** 字段组件装配目录：定义属性、调用家族 Hook、只公开视图绑定与实例方法。 */
import { defineComponent } from '@reactive-mp/runtime';
import { computed } from '@reactive-mp/reactivity';
import { useField } from '../hooks/use-field.js';
import { useChoice } from '../hooks/use-choice.js';
import { useSelect } from '../hooks/use-select.js';
import { useCascader } from '../hooks/use-cascader.js';
import { useCalendar } from '../hooks/use-calendar.js';
import { useUpload } from '../hooks/use-upload.js';
import { fieldProperties, optionProperties } from './properties.js';
const families = {
  input: useField,
  textarea: useField,
  checkbox: useChoice,
  switch: useChoice,
  'radio-group': useChoice,
  'checkbox-group': useChoice,
  select: useSelect,
  'column-picker': useSelect,
  'date-picker': useSelect,
  'region-picker': useSelect,
  cascader: useCascader,
  calendar: useCalendar,
  upload: useUpload,
};
const privateBindings = new Set([
  'value',
  'form',
  'path',
  'commit',
  'emit',
  'setPending',
]);
export function registerFieldComponent(kind, extra = {}) {
  defineComponent(
    ({ defineProps, defineOptions, extClasses, defineExpose }) => {
      defineOptions({ multipleSlots: true });
      extClasses('custom-class');
      const props = defineProps({
        ...fieldProperties,
        ...optionProperties,
        ...extra,
      });
      const field = families[kind](props, {
        scope: true,
        multiple: kind === 'checkbox-group',
        kind: {
          'column-picker': 'column',
          'date-picker': 'date',
          'region-picker': 'region',
        }[kind],
        validateOn: kind === 'input' || kind === 'textarea' ? 'blur' : 'change',
      });
      defineExpose({
        setValidators: field.setValidators,
        setMessages: field.setMessages,
        ...(kind === 'upload'
          ? {
              upload: field.upload,
              retry: field.retry,
              remove: field.remove,
              addFiles: field.addFiles,
              setAdapter: field.setAdapter,
            }
          : {}),
      });
      const bindings = Object.fromEntries(
        Object.entries(field)
          .filter(([name]) => !privateBindings.has(name))
          .map(([name, value]) => [
            name === 'required'
              ? 'fieldRequired'
              : name === 'month'
                ? 'calendarMonth'
                : name,
            value,
          ]),
      );
      return {
        ...bindings,
        noop() {},
        count: computed(() => Array.from(String(field.value() ?? '')).length),
      };
    },
  );
}
