/** date-picker 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('date-picker', {
  defaultValue: { type: String, value: '' },
  mode: { type: String, value: 'date' },
  min: String,
  max: String,
  fields: { type: String, value: 'day' },
  defaultPickerValue: String,
});
