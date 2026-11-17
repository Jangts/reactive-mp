/** 自定义复合字段：两个原生 input 合成一个对象，只注册一个逻辑字段。 */
import { defineComponent } from '../../vendor/reactive-mp/src/index.js';
import { useField } from '../../vendor/components/miniprogram/form/index.js';
defineComponent(({ defineProps }) => {
  const props = defineProps({
    name: { type: null, value: '' },
    defaultValue: { type: Object, value: { x: 0, y: 0 } },
  });
  const field = useField(props, { scope: true });
  return {
    point: field.value,
    changeX: (event) =>
      field.commit({ ...field.value(), x: Number(event.detail.value) }),
    changeY: (event) =>
      field.commit({ ...field.value(), y: Number(event.detail.value) }),
    error: field.errorMessage,
  };
});
