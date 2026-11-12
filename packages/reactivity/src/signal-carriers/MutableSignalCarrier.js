/** 通过公共载体构造流程提供可写对象及批量赋值入口。 */
import { SignalCarrier, useSignalCarrier } from './carriers.js';

class MutableSignalCarrier extends SignalCarrier {
  constructor(target) {
    super(target, true);
  }
}

/**
 * @template {Record<string, any>} T
 * @param {T} target
 * @returns {[import('@reactive-mp/reactivity').Reactive<T>, (source: Partial<T>) => boolean]}
 */
export default function useMutableSignalCarrier(target) {
  return useSignalCarrier(target, MutableSignalCarrier);
}
