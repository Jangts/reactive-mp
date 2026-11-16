/** 副作用资源作用域：维护嵌套归属、无追踪收集与异常安全清理。 */
import { CombinedError } from '@reactive-mp/shared';
let currentScope = null;

class EffectScope {
  #disposers = new Set();
  #unlink = null;
  #stopped = false;
  #running = false;
  isEffectFree = false;
  get isRunning() {
    return this.#running;
  }
  constructor(effectFree = false, detached = false) {
    // Detaching resource ownership must not escape collection semantics.
    this.isEffectFree = effectFree || !!currentScope?.isEffectFree;
    if (!detached && currentScope && !currentScope.isEffectFree) {
      this.#unlink = currentScope.addDisposer(() => this.stop());
    }
  }
  addDisposer(handle) {
    if (this.isEffectFree) {
      return () => {};
    }
    if (this.#stopped) {
      throw Error('cannot register cleanup in a stopped effect scope');
    }
    this.#disposers.add(handle);
    return () => this.#disposers.delete(handle);
  }
  run(fn) {
    if (this.#stopped) {
      throw Error('cannot run a stopped effect scope');
    }
    const previous = currentScope,
      wasRunning = this.#running;
    currentScope = this;
    this.#running = true;
    try {
      return fn();
    } finally {
      currentScope = previous;
      this.#running = wasRunning;
    }
  }
  stop() {
    if (this.#stopped || this === collectionScope) {
      return;
    }
    this.#stopped = true;
    const errors = [];
    this.#unlink?.();
    for (const dispose of this.#disposers) {
      try {
        dispose();
      } catch (error) {
        errors.push(error);
      }
    }
    this.#disposers.clear();
    if (errors.length) {
      throw new CombinedError(errors, 'effect scope cleanup failed');
    }
  }
}
const collectionScope = new EffectScope(true);
export function runInEffectFreeScope(fn) {
  return collectionScope.run(fn);
}
export function isRunInEffectFreeScope() {
  return !!currentScope?.isEffectFree;
}
function expose(scope) {
  return {
    run: scope.run.bind(scope),
    stop: scope.stop.bind(scope),
    onDispose: scope.addDisposer.bind(scope),
  };
}
export default function createEffectScope(detached = false) {
  return expose(new EffectScope(false, detached));
}
export function getCurrentEffectScope() {
  return currentScope ? expose(currentScope) : null;
}
export function onScopeDispose(handle) {
  if (!currentScope || currentScope.isEffectFree) {
    return false;
  }
  if (typeof handle !== 'function') {
    throw new TypeError('cleanup must be a function');
  }
  currentScope.addDisposer(handle);
  return true;
}
