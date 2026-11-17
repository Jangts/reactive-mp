/** form-item 原生组件入口，逻辑由组合 Hook 持有。 */
import { defineComponent } from '@reactive-mp/runtime';
import { useFormItem } from '../../hooks/use-form-item.js';
import { itemProperties } from '../../utils/properties.js';
defineComponent(({ defineProps, defineOptions, extClasses }) => {
  defineOptions({ multipleSlots: true });
  extClasses('custom-class');
  return useFormItem(defineProps(itemProperties));
});
