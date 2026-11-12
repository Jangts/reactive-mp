/** 单个原生实例的资源所有者：建立绑定、挂载依赖并完整清理。 */
import { createEffectScope } from '@reactive-mp/reactivity';
import { EventBus } from '@reactive-mp/shared';
import InstanceSetupContext from './setup-context/InstanceSetupContext.js';

class InstanceLifetimeScope extends EventBus {
  #effectScope = null;
  #disposers = new Set();
  #parentScope = null;
  #isRunning = false;
  #pageId = `pageId:-1`;

  isPage = false;
  isComponent = false;

  context = null;

  get parentScope() {
    return this.#parentScope;
  }
  get isRunning() {
    return this.#isRunning;
  }
  get id() {
    return this.isPage
      ? this.#pageId
      : this.context.instance?.__wxExparserNodeId__;
  }
  get pageId() {
    return this.#pageId;
  }

  constructor(pageId) {
    super();
    this.#pageId = pageId;
    this.#effectScope = createEffectScope();
  }

  run(fn) {
    this.#isRunning = true;
    try {
      this.#effectScope.run(() => {
        fn(this.context);
        this.context.runtimeContext.withSetupContext(this.context, () =>
          this.context
            .bindSignalsAndMethods()
            .forEach((stop) => this.addLifetimeHandle('dispose', stop)),
        );
      });
      return this.context;
    } finally {
      this.#isRunning = false;
    }
  }
  attachTo(parentScope) {
    if (parentScope) {
      this.#parentScope = parentScope;
    }
    this.emit(`scopelifetimes/beforemounted`);
    return this;
  }
  getAncestorProvidedData(key, getPageScope) {
    if (this.#parentScope) {
      const data = this.#parentScope.context.getProvidedData(key);
      return (
        data || this.#parentScope.getAncestorProvidedData(key, getPageScope)
      );
    }
    return null;
  }
  addLifetimeHandle(lifetime, handle) {
    if (lifetime === 'dispose') {
      this.#disposers.add(handle);
    } else {
      this.once(`scopelifetimes/${lifetime}`, handle);
    }
    return true;
  }
  forwardInstanceLifetimeEvent(lifetime, ...payload) {
    if (
      (lifetime === 'unload' || lifetime === 'detached') &&
      this.completed?.has(lifetime)
    ) {
      return this;
    }
    if (lifetime === 'unload' || lifetime === 'detached') {
      this.completed ||= new Set();
      this.completed.add(lifetime);
    }
    if (lifetime === 'beforeDetach') {
      this.context.deactivateView?.();
    }
    this.emit(`lifetimes/${lifetime}`, payload);
    return this;
  }

  stop() {
    if (!this.#effectScope) {
      return;
    }
    const effectScope = this.#effectScope;
    this.#effectScope = null;
    const errors = [];
    const attempt = (fn) => {
      try {
        fn();
      } catch (error) {
        errors.push(error);
      }
    };
    attempt(() => this.context.deactivateView?.());
    if (this.isPage) {
      attempt(() => this.forwardInstanceLifetimeEvent('unload'));
    }
    if (this.isComponent) {
      attempt(() => this.forwardInstanceLifetimeEvent('detached'));
    }
    for (const dispose of this.#disposers) {
      attempt(dispose);
    }
    this.#disposers.clear();
    attempt(() => effectScope.stop());
    attempt(() => this.context.reset());
    this.clear();
    this.#parentScope = null;
    if (errors.length) {
      throw new AggregateError(errors, 'instance cleanup failed');
    }
  }
}

export default function createInstanceLifetimeScope(instance, configs) {
  const scope = new InstanceLifetimeScope(instance.getPageId());
  scope.context = new InstanceSetupContext({ ...configs }, instance);
  scope.isPage = !!configs.isPage;
  scope.isComponent = !!configs.isComponent;
  return scope;
}
