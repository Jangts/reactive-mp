/** 自定义 carrier 的高级适配入口；普通使用从包根导入。 */
export {
  isInternalSignalCarrier,
  useSignalCarrier,
  reactive,
  isSignalPayloadRef,
  ref,
} from './index.js';
/** 通过 useSignalCarrier 创建；直接 new 会拒绝，以保证元信息登记完整。 */
export class SignalCarrier<T extends object = Record<string, unknown>> {
  constructor(target: T, mutable?: boolean);
}

/** 平台内部适配：整体替换浅层 carrier；非浅层载体返回 false。 */
export function replaceShallowCarrierData(
  carrier: object,
  value: object,
): boolean;
