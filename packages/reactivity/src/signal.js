/** 响应式核心：可调用状态、派生计算和监听，收集阶段仅求值而不订阅。 */
import { isArray, isFunction } from '@reactive-mp/shared';
import createEffectScope, { isRunInEffectFreeScope } from './EffectScope.js';
import State from './State.js';
import TrackingScope from './TrackingScope.js';

/* ******************* *
 *        定义组        *
 * ******************* *
 */

const CONTEXT = {
  RETRACKFLAG: false,
  SIGNAL_CARRIERS: new WeakMap(),
  isSignalCarrier(carrier) {
    return this.SIGNAL_CARRIERS.has(carrier);
  },
  captureCarriedSignal(carrier) {
    return this.SIGNAL_CARRIERS.get(carrier) || null;
  },
  startToCarrySignal(carrier, signal) {
    this.SIGNAL_CARRIERS.set(carrier, signal);
    return true;
  },
  stopToCarrySignal(carrier) {
    return this.SIGNAL_CARRIERS.delete(carrier);
  },
  captureSignal(target) {
    return isTrueSignal(target) ? target : this.captureCarriedSignal(target);
  },
  WATCHING_SCOPE_STACK: [null],
  pushWatchingScope(scope) {
    this.WATCHING_SCOPE_STACK.unshift(scope);
  },
  popWatchingScope() {
    if (this.WATCHING_SCOPE_STACK.length > 1) {
      this.WATCHING_SCOPE_STACK.shift();
    }
  },
  getTopWatchingScope() {
    return this.WATCHING_SCOPE_STACK[0] || null;
  },
};

const SignalSource = Symbol('SignalSource');
const SignalPayload = Symbol('SignalPayload');
const SignalEmitters = Symbol('SignalEmitters');
const PreviousPayload = Symbol('PreviousPayload');
const IsWatchableSignal = Symbol('IsWatchableSignal');
const IsProtectedSignal = Symbol('IsProtectedSignal');
const IsComputedSignal = Symbol('IsComputedSignal');
const isTrueSignal = (target) => target?.[SignalSource] !== undefined;
const isWatchableSignal = (target) => target?.[IsWatchableSignal] === true;
const assertIsNotInWatchingScope = (action) => {
  const cause = CONTEXT.getTopWatchingScope();
  if (cause) {
    throw new Error(`cannot ${action} in effect`, { cause });
  }
};

/* ******************* *
 *        类型组        *
 * ******************* *
 */

class WatchingScope extends TrackingScope {
  static noTracking = () => false;
  #effect = null;
  isTrackedForCompute = false;
  constructor(effect, { once, isTrackedForCompute, ...configs } = {}) {
    super({
      ...configs,
      isSync: !!isTrackedForCompute,
    });
    this.#effect = effect;
    this.isTrackedForCompute = !!isTrackedForCompute;
    if (once) {
      this.once('effect', this.runEffect.bind(this));
    } else {
      this.on('effect', this.runEffect.bind(this));
    }
    this.on = () => () => {};
  }
  run(fn) {
    return super.run(fn, {
      setScope: () => CONTEXT.pushWatchingScope(this),
      resetScope: () => CONTEXT.popWatchingScope(),
    });
  }
  runEffect() {
    if (this.canTrack !== WatchingScope.noTracking) {
      this.unTrackAll();
    }
    this.run(this.#effect);
    return this;
  }
}
class TrackableState extends State {
  constructor(value) {
    const watchable = !isRunInEffectFreeScope();
    super(value, {
      watchable,
      onGet: ({ payload }) => {
        const signal = this.$ref?.deref();
        if (signal) {
          CONTEXT.getTopWatchingScope()?.track({
            signal: this.$ref?.deref(),
            type: 'track',
            value: payload.value,
          });
        } else {
          this.freeze();
        }
      },
      onBeforeSet: ({ payload }) => {
        const scope = CONTEXT.getTopWatchingScope();
        if (scope) {
          if (scope.isTrackedForCompute) {
            payload.newValue = payload.value;
            throw new Error('cannot update state of signal in computed effect');
          }
        }
      },
      onAfterSet: ({ payload }) => {
        const signal = this.$ref?.deref();
        if (signal) {
          signal[PreviousPayload] = signal[SignalPayload];
          signal[SignalPayload] = { value: payload.value };
        } else {
          this.freeze();
        }
      },
    });
  }
}
class Signal {
  static create(value) {
    const state = new TrackableState(value);
    const meta = {
      [SignalSource]: state,
      [IsWatchableSignal]: state.watchable,
      [SignalEmitters]: new Set(),
      [PreviousPayload]: { value },
      [SignalPayload]: { value },
    };
    const signal = new Proxy(this, {
      apply: () => state.value,
      get: (t, p) =>
        p === '__is_signal'
          ? true
          : p === '__is_computed'
            ? signal[IsComputedSignal]
            : p === 'value'
              ? state.value
              : meta[p],
      set: (target, property, value) => {
        if (property === 'value') {
          throw new TypeError('Signal.value is readonly; use its emitter');
        }
        meta[property] = value;
        return true;
      },
    });
    state.$ref = new WeakRef(signal);
    return signal;
  }
  static update(
    signal,
    value,
    { forced = false, shouldBeRetrack = false } = {},
  ) {
    const previous = CONTEXT.RETRACKFLAG;
    try {
      CONTEXT.RETRACKFLAG = shouldBeRetrack;
      if (forced) {
        signal[SignalSource].set(value, true);
      } else {
        signal[SignalSource].value = value;
      }
      return true;
    } finally {
      CONTEXT.RETRACKFLAG = previous;
    }
  }
}

/* ******************* *
 *        判断组        *
 * ******************* *
 */

/**
 * @template T
 * @param {() => unknown} fn
 * @returns {fn is () => T}
 */
export const isGetter = (fn) => isFunction(fn);

/**
 * @template T
 * @template {boolean} B
 * @param {() => T | Record<string, any>} target
 * @param {B} isRealSignal
 * @returns {target is B extends true? import('@reactive-mp/reactivity').Signal<T> : import('@reactive-mp/reactivity').Signal<T> | import('@reactive-mp/reactivity').Reactive<object> | import('@reactive-mp/reactivity').ReadonlyCarrier<object>}
 */
export const isSignal = (target, isRealSignal) =>
  isRealSignal
    ? isTrueSignal(target)
    : isTrueSignal(target) || CONTEXT.isSignalCarrier(target);

/**
 * @template T
 * @param {unknown} target
 * @returns {target is import('@reactive-mp/reactivity').Signal<T> | import('@reactive-mp/reactivity').Reactive<object> | import('@reactive-mp/reactivity').ReadonlyCarrier<object>}
 */
export const isWatchable = (target) =>
  isWatchableSignal(target) ||
  isWatchableSignal(CONTEXT.captureCarriedSignal(target));

/**
 * @template T
 * @param {() => T | Record<string, any>} target
 * @returns {target is import('@reactive-mp/reactivity').ComputedSignal<T>}
 */
export const isComputedSignal = (target) =>
  !!CONTEXT.captureSignal(target)?.[IsComputedSignal];

/* ******************* *
 *        创建组        *
 * ******************* *
 */

/**
 * Create And Use Signal
 *
 * @template T
 * @param {T} value
 * @returns {[import('@reactive-mp/reactivity').Signal<T>, import('@reactive-mp/reactivity').SignalEmitter<T>]}
 */
export function useSignal(value) {
  const signal = CONTEXT.captureSignal(value) || Signal.create(value);
  if (signal[IsProtectedSignal]) {
    return [signal, null];
  }
  return [signal, Signal.update.bind(null, signal)];
}

/**
 * Create And Use Computed Signal
 *
 * @template T
 * @param {() => T} getter
 * @param {import('@reactive-mp/reactivity').TrackOptions} options
 * @returns {import('@reactive-mp/reactivity').ComputedSignal<T>}
 */
export function useComputedSignal(
  getter,
  { onTrack = null, onTrigger = null } = {},
) {
  assertIsNotInWatchingScope(`define computed signal`);
  if (!isGetter(getter)) {
    throw new Error('getter for computed signal must be a function');
  }
  const signal = Signal.create();
  signal[IsProtectedSignal] = true;
  signal[IsComputedSignal] = true;
  const scope = new WatchingScope(() => getter(), {
    onTrack,
    onTrigger,
    isTrackedForCompute: true,
    onResult: ({ payload }) => (signal[SignalSource].value = payload),
  });
  try {
    scope.runEffect();
  } catch (error) {
    scope.stop();
    throw error;
  }
  signal[SignalEmitters].add(scope);
  return signal;
}

/**
 * Start To Carry A Signal
 *
 * @template {Record<string, any>} T
 * @param {T} target
 * @param {import('@reactive-mp/reactivity').Signal<T|any>} signal
 * @returns {()=>boolean} stop
 */
export function carrySignal(target, signal) {
  if (
    target === null ||
    (typeof target !== 'object' && typeof target !== 'function')
  ) {
    throw new Error('signal carrier must be a plain object');
  }
  if (CONTEXT.isSignalCarrier(target)) {
    return () => false;
  }
  if (isTrueSignal(signal)) {
    CONTEXT.startToCarrySignal(target, signal);
    return () => CONTEXT.stopToCarrySignal(target);
  }
  return () => false;
}

/* ******************* *
 *        调整组        *
 * ******************* *
 */

/**
 * Protect Signal
 *
 * @param {import('@reactive-mp/reactivity').Signal} signal
 */
export function protectSignal(signal) {
  if (isTrueSignal(signal)) {
    return (signal[IsProtectedSignal] = true);
  }
  throw new Error('signal carrier must be a plain object');
}

/* ******************* *
 *        收发组        *
 * ******************* *
 */

/**
 * Track Signal
 *
 * @template T
 * @param {import('@reactive-mp/reactivity').Signal<T> | import('@reactive-mp/reactivity').Reactive<object> | import('@reactive-mp/reactivity').ReadonlyCarrier<object>} target
 * @param {(payload: import('@reactive-mp/reactivity').TrackPayload<T>)=>void} effect
 * @returns {()=>boolean} stop
 */
export function trackSignal(target, effect) {
  if (!isRunInEffectFreeScope() && isFunction(effect)) {
    const signal = CONTEXT.captureSignal(target);
    if (!signal) {
      throw new TypeError('trackSignal requires a Signal or carrier');
    }
    return signal[SignalSource].subscribe((payload) =>
      effect({ ...payload, shouldBeRetrack: CONTEXT.RETRACKFLAG }),
    );
  }
  return () => {};
}

/**
 * Emit Signal
 *
 * @template T
 * @param {import('@reactive-mp/reactivity').Signal<T> | import('@reactive-mp/reactivity').Reactive<object> | import('@reactive-mp/reactivity').ReadonlyCarrier<object>} target
 * @param {{value: T} & UpdateSignalValueOptions} payload
 * @returns {boolean}
 */
export function emitSignal(target, payload) {
  const signal = CONTEXT.captureSignal(target);
  if (!signal?.[IsProtectedSignal] && signal?.[SignalSource]) {
    Signal.update(signal, payload.value, payload);
    return true;
  }
  return false;
}

/**
 * Interpret Signal
 *
 * @template T
 * @param {import('@reactive-mp/reactivity').Signal<T> | import('@reactive-mp/reactivity').Reactive<object> | import('@reactive-mp/reactivity').ReadonlyCarrier<object>} target
 * @param {boolean} slient
 * @returns {T | void}
 */
export function interpretSignal(target, slient = false) {
  const signal = CONTEXT.captureSignal(target);
  if (slient) {
    return signal?.[SignalSource].get();
  }
  return signal?.();
}

/* ******************* *
 *        观察组        *
 * ******************* *
 */

/**
 * Watch Signals
 *
 * @template T
 * @param {Readonly<T>} source
 * @param {(values: import('@reactive-mp/reactivity').WatchValue<T>, oldValues: import('@reactive-mp/reactivity').WatchValue<T>)=>void} callback
 * @param {import('@reactive-mp/reactivity').WatchOptions} options
 * @returns {import('@reactive-mp/reactivity').WatchHandle}
 */
export function watchSignals(
  source,
  callback,
  { immediate = false, once = false, onTrack = null, onTrigger = null } = {},
) {
  assertIsNotInWatchingScope(`watch signal`);
  if (isFunction(callback) === false) {
    throw new TypeError('watch callback must be a function');
  }
  if (isRunInEffectFreeScope()) {
    return TrackingScope.emptyWatchHandle;
  }
  const getterScopes = [];
  const createGetter = (getter) => {
    const owner = createEffectScope();
    getterScopes.push(owner);
    try {
      return owner.run(() => useComputedSignal(getter));
    } catch (error) {
      owner.stop();
      throw error;
    }
  };
  const isArrSrc = isArray(source);
  source = isSignal(source)
    ? [CONTEXT.captureSignal(source)]
    : isGetter(source)
      ? [createGetter(source)]
      : isArrSrc
        ? source.map((s) =>
            isSignal(s)
              ? CONTEXT.captureSignal(s)
              : isGetter(s)
                ? createGetter(s)
                : s,
          )
        : [];
  if (source.length === 0) {
    return TrackingScope.emptyWatchHandle;
  }
  let previous = source.map((signal) =>
    isSignal(signal) ? interpretSignal(signal, true) : signal,
  );
  let first = true;
  const effect = () => {
    const values = source.map((signal) =>
      isSignal(signal) ? interpretSignal(signal, true) : signal,
    );
    const oldValues =
      immediate && first ? source.map(() => undefined) : previous;
    previous = values;
    first = false;
    if (isArrSrc) {
      callback?.(values, oldValues);
    } else {
      callback?.(values[0], oldValues[0]);
    }
    if (once) {
      CONTEXT.getTopWatchingScope()?.stop();
    }
  };
  const scope = new WatchingScope(effect, { onTrack, onTrigger });
  scope.onStop(() => {
    for (const owner of getterScopes) {
      owner.stop();
    }
    source = null;
    callback = null;
  });
  scope.run(() => source.forEach((signal) => interpretSignal(signal)));
  scope.canTrack = WatchingScope.noTracking;
  if (immediate) {
    scope.runEffect();
  }
  return scope.exposeHandle();
}

/**
 * Watch Effect
 *
 * @param {() => unknown} effect
 * @param {import('@reactive-mp/reactivity').TrackOptions} options
 * @returns {import('@reactive-mp/reactivity').WatchHandle}
 */
export function watchEffect(effect, { onTrack = null, onTrigger = null } = {}) {
  assertIsNotInWatchingScope(`watch effect`);
  if (isRunInEffectFreeScope()) {
    return TrackingScope.emptyWatchHandle;
  }
  const scope = new WatchingScope(effect, { onTrack, onTrigger });
  try {
    return scope.runEffect().exposeHandle();
  } catch (error) {
    scope.stop();
    throw error;
  }
}
