/** 应用、页面和组件的运行时登记，集中维护活动上下文及恢复边界。 */
import { CombinedError } from '@reactive-mp/shared';
import { createEffectScope } from '@reactive-mp/reactivity';
import { isFunction } from '@reactive-mp/shared';
import { createSettingUpContext } from './etc/creators.js';
import createInstanceLifetimeScope from './InstanceLifetimeScope.js';
import AppSetupContext from './setup-context/AppSetupContext.js';
import SetupContext from './setup-context/SetupContext.js';

class AppLifetimeScope {
  #effectScope = createEffectScope(true);
  context = null;
  run(setup, native, runtime) {
    const context = new AppSetupContext();
    context.runtimeContext = runtime;
    this.context = context;
    try {
      runtime.withSetupContext(context, () =>
        this.#effectScope.run(() => {
          const result =
            typeof setup === 'function'
              ? setup(createSettingUpContext(context, null))
              : {};
          if (result && typeof result.then === 'function') {
            throw new TypeError('App setup must be synchronous');
          }
          if (result != null && typeof result !== 'object') {
            throw new TypeError('App setup must return an object');
          }
          context.setupRecords = result ?? {};
        }),
      );
      return context;
    } catch (error) {
      try {
        this.#effectScope.stop();
      } catch (cleanupError) {
        throw new CombinedError(
          [error, cleanupError],
          'App setup and cleanup failed',
        );
      }
      throw error;
    }
  }
}

export default class {
  constructor() {
    this.setPageScope = this.setPageScope.bind(this);
    this.getPageScope = this.getPageScope.bind(this);
    this.setComponentScope = this.setComponentScope.bind(this);
    this.getComponentScope = this.getComponentScope.bind(this);
    this.getParentScopeOf = this.getParentScopeOf.bind(this);
  }

  /**
   * @type {SetupContext | null}
   */
  #ActiveSetupContext = null;
  /**
   * @param { SetupContext | null } ctx
   * @returns { SetupContext | null }
   */
  setSetupContext(ctx) {
    const _ctx = ctx || this.#ActiveSetupContext;
    this.#ActiveSetupContext = ctx;
    return _ctx;
  }
  getSetupContext() {
    return this.#ActiveSetupContext;
  }

  /**
   * @type {AppLifetimeScope | null}
   */
  #AppLifetimeScope = null;
  runAppSetup(setup, native) {
    if (this.#AppLifetimeScope) {
      throw new Error('cannot define App more than one time.');
    }
    this.#AppLifetimeScope = new AppLifetimeScope();
    try {
      return this.#AppLifetimeScope.run(setup, native, this);
    } catch (error) {
      this.#AppLifetimeScope = null;
      throw error;
    }
  }
  getAppSetupRecords() {
    return Object.freeze({ ...this.#AppLifetimeScope?.context?.setupRecords });
  }

  /**
   * @type {Map<string, ReturnType<createInstanceLifetimeScope>>}
   */
  #PageLifetimeScopeMap = new Map();
  /**
   * @type {WeakMap<ComponentInstance, ReturnType<createInstanceLifetimeScope>>}
   */
  #ComponentLifetimeScopeMap = new WeakMap();
  /**
   * @type {ReturnType<createInstanceLifetimeScope> | null}
   */
  #InstanceLifetimeScope = null;
  /**
   *
   * @param {ReturnType<createInstanceLifetimeScope>} scope
   */
  withInstanceScope(scope, fn) {
    const previous = this.#InstanceLifetimeScope;
    this.#InstanceLifetimeScope = scope;
    try {
      return fn();
    } finally {
      this.#InstanceLifetimeScope = previous;
    }
  }
  withSetupContext(context, fn) {
    const previous = this.#ActiveSetupContext;
    this.#ActiveSetupContext = context;
    try {
      return fn();
    } finally {
      this.#ActiveSetupContext = previous;
    }
  }
  getInstanceLifetimeScope() {
    return this.#InstanceLifetimeScope;
  }
  /**
   *
   * @param {string} id
   * @param {ReturnType<createInstanceLifetimeScope> | null} scope
   * @returns {ReturnType<createInstanceLifetimeScope> | null}
   */
  setPageScope(id, scope) {
    if (scope) {
      this.#PageLifetimeScopeMap.set(id, scope);
    } else {
      this.#PageLifetimeScopeMap.delete(id);
    }
    return scope;
  }
  /**
   *
   * @param {string} id
   * @returns {ReturnType<createInstanceLifetimeScope> | null}
   */
  getPageScope(id) {
    return this.#PageLifetimeScopeMap.get(id) || null;
  }
  /**
   * @param {ComponentInstance} instance
   * @param {ReturnType<createInstanceLifetimeScope> | null} scope
   * @returns {ReturnType<createInstanceLifetimeScope> | null}
   */
  setComponentScope(instance, scope) {
    if (scope) {
      this.#ComponentLifetimeScopeMap.set(instance, scope);
    } else {
      this.#ComponentLifetimeScopeMap.delete(instance);
    }
    return scope;
  }
  /**
   * @param {ComponentInstance} instance
   * @returns {ReturnType<createInstanceLifetimeScope> | null}
   */
  getComponentScope(instance) {
    return this.#ComponentLifetimeScopeMap.get(instance) || null;
  }
  /**
   * @param {ReturnType<createInstanceLifetimeScope> | null} scope
   * @returns {ReturnType<createInstanceLifetimeScope> | null}
   */
  getParentScopeOf(scope) {
    let parent = null;
    let instance = scope.context.instance;
    for (;;) {
      instance = instance?.selectOwnerComponent();
      if (!instance) {
        const page = this.getPageScope(scope.pageId);
        return page === scope ? null : page;
      }
      parent = this.getComponentScope(instance);
      if (parent) {
        return parent;
      }
    }
  }

  /**
   * @type {import('@reactive-mp/runtime').ComponentContext | null}
   */
  #SettingUpContext = null;
  /**
   * @param {import('@reactive-mp/runtime').SetupContext | null} ctx
   */
  setSettingUpContext(ctx) {
    return (this.#SettingUpContext = ctx);
  }
  getSettingUpContext() {
    return this.#SettingUpContext;
  }

  /**
   * @param {(context: object) => Record<string, unknown>} setup
   * @param {SetupContext} ctx
   * @returns {SetupContext}
   */
  runSetup(setup, ctx) {
    const previousContext = this.getSetupContext();
    const previousSettingUp = this.getSettingUpContext();
    ctx.runtimeContext = this;
    this.setSetupContext(ctx);
    try {
      if (isFunction(setup)) {
        const settingUpContext = this.setSettingUpContext(
          createSettingUpContext(
            ctx,
            ctx.instance ? this.getInstanceLifetimeScope() : null,
          ),
        );
        const result = setup(settingUpContext);
        if (result && typeof result.then === 'function') {
          throw new TypeError('setup must synchronously return an object');
        }
        if (result != null && typeof result !== 'object') {
          throw new TypeError('setup must return an object or undefined');
        }
        ctx.setupReturns = result ?? {};
      }
      return ctx;
    } finally {
      this.setSettingUpContext(previousSettingUp);
      this.setSetupContext(previousContext);
    }
  }
}
