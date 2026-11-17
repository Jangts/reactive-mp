/** upload 原生组件入口，逻辑由组合 Hook 持有。 */
import { registerFieldComponent } from '../../utils/component.js';
registerFieldComponent('upload', {
  defaultValue: { type: Array, value: [] },
  accept: { type: Array, value: ['image'] },
  adapter: String,
  maxCount: { type: Number, value: 9 },
  maxSize: { type: Number, value: 0 },
  typeLimits: { type: Object, value: {} },
  autoUpload: { type: Boolean, value: true },
  retryCount: { type: Number, value: 0 },
  title: String,
  description: String,
});
