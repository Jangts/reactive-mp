import { createEffectScope } from "@reactive-mp/reactivity";
import { isFunction } from "@reactive-mp/shared";
import { createSettingUpContext } from "./etc/creators.js";
import createInstanceLifetimeScope from "./InstanceLifetimeScope.js";
import AppSetupContext from "./setup-context/AppSetupContext.js";
import SetupContext from "./setup-context/SetupContext.js";

class AppLifetimeScope {
  #effectScope = createEffectScope();
  context = null;
  run(setup) {
    try {
      this.context = new AppSetupContext(
        isFunction(setup) ? this.#effectScope.run(setup) : setup
      );
      return this.context;
    } catch (error) {
      this.#effectScope.stop();
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
  runAppSetup(setup) {
    if (this.#AppLifetimeScope) {
      throw new Error("cannot define App more than one time.");
    }
    this.#AppLifetimeScope = new AppLifetimeScope();
    try { return this.#AppLifetimeScope.run(setup); }
    catch (error) { this.#AppLifetimeScope = null; throw error; }
  }
  getAppSetupRecords() {
    return Object.freeze(this.#AppLifetimeScope?.context?.setupRecords || {});
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
    try { return fn(); } finally { this.#InstanceLifetimeScope = previous; }
  }
  withSetupContext(context, fn) {
    const previous = this.#ActiveSetupContext;
    this.#ActiveSetupContext = context;
    try { return fn(); } finally { this.#ActiveSetupContext = previous; }
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
      if (parent) return parent;
    }
  }

  /**
   * @type {PageSettingUpContext & ComponentSettingUpContext | null}
   */
  #SettingUpContext = null;
  /**
   * @param {PageSettingUpContext | ComponentSettingUpContext | null} ctx
   */
  setSettingUpContext(ctx) {
    return (this.#SettingUpContext = ctx);
  }
  getSettingUpContext() {
    return this.#SettingUpContext;
  }

  /**
   * @param {CommonFunction<Record<string,unknown>, [SettingUpContext]>} setup
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
            ctx.instance ? this.getInstanceLifetimeScope() : null
          )
        );
        ctx.setupReturns = setup(settingUpContext) || {};
      }
      return ctx;
    } finally {
      this.setSettingUpContext(previousSettingUp);
      this.setSetupContext(previousContext);
    }
  }
}
