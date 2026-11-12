/** Hook 调用边界：需要活动 setup 的操作不得静默丢失；阶段空行为由上下文实现。 */
import { useActiveSetupContext } from '../main.js';

/** 返回当前 setup；无上下文时给出明确错误，不将错误伪装为成功的空操作。 */
export function requireSetupContext() {
  const context = useActiveSetupContext();
  if (!context) {
    throw Error('this hook must be called synchronously inside setup');
  }
  return context;
}

/** 调用当前宿主提供的声明能力，保留其返回值和接收者。 */
export function callSetupCapability(name, ...args) {
  const context = requireSetupContext().settingUpContext;
  const capability = context[name];
  if (typeof capability !== 'function') {
    throw Error(`${name} is unavailable in this setup`);
  }
  return capability.apply(context, args);
}
