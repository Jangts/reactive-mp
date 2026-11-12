/** 用户注册入口：持有一个运行时，具体收集和原生回调适配由下层拥有。 */
import { exposeActiveSetupContext } from './etc/exposers.js';
import { formatSetupOptions } from './etc/formatters.js';
import RuntimeContext from './SetupRuntimeContext.js';
import { registerDefinition } from './registration.js';

const CONTEXT = new RuntimeContext();

export const useSetupApp = () => CONTEXT.getAppSetupRecords();
export const useActiveSetupContext = () => exposeActiveSetupContext(CONTEXT);
export function defineApp(setup, options) {
  let native = options ?? {};
  let create = setup;
  if (typeof setup !== 'function') {
    const { setup: callback, ...fields } = setup ?? {};
    create = callback;
    native = fields;
  }
  const { globalData, setupMethods } = CONTEXT.runAppSetup(
    create,
    native,
  ).formatDataAndMethods(native);
  App({ ...setupMethods, globalData });
}
export function definePage(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  registerDefinition(CONTEXT, fn, native, 'page');
}
export function defineComponent(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  registerDefinition(CONTEXT, fn, native, 'component');
}
export function defineComponentPage(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  registerDefinition(CONTEXT, fn, native, 'component-page');
}
