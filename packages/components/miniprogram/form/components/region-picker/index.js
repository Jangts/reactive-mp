/** region-picker 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('region-picker', {
  defaultValue: { type: Array, value: [] },
  level: { type: String, value: 'region' },
});
