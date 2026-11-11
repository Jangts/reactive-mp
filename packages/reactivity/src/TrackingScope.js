import { debounceMicrotask, EventBus } from "@reactive-mp/shared";
import { trackSignal } from "./signal.js";
import { onScopeDispose } from "./EffectScope.js";

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
    this.on("track", onTrack);
    this.on("result", onResult);
    this.triggerEffect = this.triggerEffect.bind(this);
    if (isSync) {
      this.#isSync = true;
    } else {
      this.triggerEffect = debounceMicrotask(this.triggerEffect, (payload) =>
        onTrigger?.({
          type: "trigger",
          payload,
        })
      );
    }
    onScopeDispose(this.stop.bind(this));
  }
  triggerEffect({ shouldBeRetrack }) {
    if (this.#paused) return;
    this.#isOccurringEffect = true;
    try {
      this.emit("effect");
    } finally {
      this.#isOccurringEffect = false;
    }
  }

  exposeHanlde(onAfterStop) {
    const stop = () => (this.stop(), onAfterStop?.(), void 0);
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
    this.emit("result", result, null);
    return result;
  }

  track({ signal, value }) {
    const { trackedSignals } = this;
    if (this.canTrack(signal)) {
      this.#isTrackingSignal = true;
      trackedSignals.set(signal, trackSignal(signal, this.triggerEffect));
      this.#isTrackingSignal = false;
    }
    this.emit("track", { signal, value }, null);
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
    this.#paused = false;
  }
  stop() {
    this.unTrackAll();
    this.clear();
  }
}
