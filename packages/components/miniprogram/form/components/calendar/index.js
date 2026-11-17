/** calendar 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('calendar', {
  defaultValue: { type: String, value: '' },
  min: String,
  max: String,
  month: String,
  disabledDates: { type: Array, value: [] },
  weekdays: { type: Array, value: ['日', '一', '二', '三', '四', '五', '六'] },
});
