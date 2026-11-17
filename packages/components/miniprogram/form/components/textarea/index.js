/** textarea 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('textarea', {
  placeholder: { type: String, value: '请输入' },
  defaultValue: { type: String, value: '' },
  type: { type: String, value: 'text' },
  maxlength: { type: Number, value: -1 },
  autoHeight: { type: Boolean, value: true },
  showCount: Boolean,
  focus: Boolean,
  adjustPosition: { type: Boolean, value: true },
  confirmType: { type: String, value: 'done' },
  password: Boolean,
});
