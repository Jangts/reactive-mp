/** 依赖追踪作用域：拥有订阅、刷新调度和停止句柄，销毁后不再执行。 */
import { queueJob } from './job-queue.js';
import { EventBus } from '@reactive-mp/shared';
import { trackSignal } from './signal.js';
import {
  getCurrentEffectScope,
  isRunInEffectFreeScope,
} from './EffectScope.js';

export default class extends EventBus {
  static get emptyWatchHandle() {
    const stop = () => {};
    stop.pause = () => {};
    stop.resume = () => {};
    stop.stop = stop;
    return Object.freeze(stop);
  }

  #isRunning = false;
  #isSync = false;
  #isOccurringEffect = false;
  #paused = false;
  #stopped = false;
  #unlink = null;
  #cleanup = [];
  #isTrackingSignal = false;
  trackedSignals = new Map();

  get isSync() {
    return this.#isSync;
  }
  get isRunning() {
    return this.#isRunning;
  }
  get isOccurringEffect() {
    return this.#isOccurringEffect;
  }
  get isTrackingSignal() {
    return this.#isTrackingSignal;
  }

  constructor({ onTrigger, onTrack, onResult, isSync = false } = {}) {
    super();
    this.on('track', onTrack);
    this.on('result', onResult);
    this.triggerEffect = this.triggerEffect.bind(this);
    if (isSync) {
      this.#isSync = true;
    } else {
      const run = this.triggerEffect;
      this.triggerEffect = (payload) => {
        queueJob(run);
        onTrigger?.({ type: 'trigger', payload });
      };
    }
    if (!isRunInEffectFreeScope()) {
      this.#unlink = getCurrentEffectScope()?.onDispose(() => this.stop());
    }
  }
  triggerEffect() {
    if (this.#paused || this.#stopped) {
      return;
    }
    this.#isOccurringEffect = true;
    try {
      this.emit('effect');
    } finally {
      this.#isOccurringEffect = false;
    }
  }

  exposeHandle(onAfterStop) {
    const stop = () => {
      this.stop();
      onAfterStop?.();
    };
    stop.pause = this.pause.bind(this);
    stop.resume = this.resume.bind(this);
    stop.stop = stop;
    return Object.freeze(stop);
  }
  hasTracked(signal) {
    return this.trackedSignals.has(signal);
  }
  canTrack(signal) {
    return this.hasTracked(signal) === false;
  }
  run(fn, { setScope, resetScope } = {}) {
    const wasRunning = this.#isRunning;
    let result;
    try {
      setScope?.(this);
      this.#isRunning = true;
      result = fn();
    } finally {
      this.#isRunning = wasRunning;
      resetScope?.(this);
    }
    this.emit('result', result, null);
    return result;
  }

  track({ signal, value }) {
    const { trackedSignals } = this;
    if (this.canTrack(signal)) {
      this.#isTrackingSignal = true;
      trackedSignals.set(signal, trackSignal(signal, this.triggerEffect));
      this.#isTrackingSignal = false;
    }
    this.emit('track', { signal, value }, null);
  }
  unTrackAll() {
    const { trackedSignals } = this;
    if (trackedSignals.size) {
      Array.from(trackedSignals.values()).forEach((untrack) => untrack());
      trackedSignals.clear();
    }
  }
  pause() {
    this.#paused = true;
  }
  resume() {
    if (!this.#stopped) {
      this.#paused = false;
    }
  }
  onStop(handle) {
    this.#cleanup.push(handle);
  }
  stop() {
    if (this.#stopped) {
      return;
    }
    this.#stopped = true;
    this.#unlink?.();
    for (const cleanup of this.#cleanup.splice(0)) {
      cleanup();
    }
    this.unTrackAll();
    this.clear();
  }
}
