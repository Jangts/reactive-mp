/** select 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('select', {
  presentation: { type: String, value: 'native' },
  multiple: Boolean,
  title: String,
});
