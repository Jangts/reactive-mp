/** 向组合 Hook 暴露活动上下文与作用域，只在有真实实例时提供实例能力。 */
import {
  pageEventNames,
  pageHookNames,
  scopeLifetimeNames,
} from './constants.js';

/**
 *
 * @param {import('../SetupRuntimeContext.js').default} rtCtx
 * @returns {Partial<import('@reactive-mp/runtime').SetupContext>}
 */
function exposeSettingUpContext(rtCtx) {
  const settingUpContext = rtCtx.getSettingUpContext();
  if (settingUpContext) {
    const { behaviors, extClasses, inject, observe, provide, defineRelation } =
      settingUpContext;
    return {
      behaviors,
      extClasses,
      inject,
      observe,
      provide,
      defineRelation,
    };
  }
  return {};
}

/**
 * @param {ReturnType<typeof import('../InstanceLifetimeScope.js').default>} scope
 * @param {import('../SetupRuntimeContext.js').default} rtCtx
 * @returns {object | null}
 */
const formatExposedILTScope = (scope, rtCtx) => {
  if (scope) {
    const { isPage, isComponent, parentScope } = scope;
    const instance = scope.context.instance;
    const pageScope = rtCtx.getPageScope(scope.pageId);
    let exposedParentScope = null;
    let exposedPageScope = null;
    return {
      isPage,
      isComponent,
      get instance() {
        return instance;
      },
      get pageInstance() {
        return pageScope?.context.instance || null;
      },
      getParentScope: () => {
        if (!exposedParentScope) {
          exposedParentScope = formatExposedILTScope(parentScope, rtCtx);
        }
        return exposedParentScope;
      },
      getPageScope: () => {
        if (!exposedPageScope) {
          exposedPageScope = formatExposedILTScope(pageScope, rtCtx);
        }
        return exposedPageScope;
      },
      /**
       *
       * @param {string} lifetime
       * @param {() => void} handle
       * @returns
       */
      on: (lifetime, handle) => {
        if (scopeLifetimeNames.includes(lifetime)) {
          return scope.addLifetimeHandle(lifetime, handle);
        }
        return false;
      },
    };
  }
  return null;
};
function exposeInstanceLifetimeScope(rtCtx) {
  return formatExposedILTScope(
    rtCtx.getSetupContext()?.instance ? rtCtx.getInstanceLifetimeScope() : null,
    rtCtx,
  );
}

/**
 * @param {import('../SetupRuntimeContext.js').default} rtCtx
 * @returns {object}
 */
export function exposeActiveSetupContext(rtCtx) {
  const ctx = rtCtx.getSetupContext();
  if (ctx) {
    const { isPage, isComponent } = ctx;
    const scope = ctx.instance ? rtCtx.getInstanceLifetimeScope() : null;
    return {
      isPage,
      isComponent,
      lifetimeScope: exposeInstanceLifetimeScope(rtCtx),
      settingUpContext: exposeSettingUpContext(rtCtx),
      /**
       * @param {string} name
       * @param {(...args: unknown[]) => void} listener
       * @returns
       */
      on: (name, listener) => {
        if (pageHookNames.includes(name)) {
          return ctx.addPageHook(scope, name, listener);
        }
        if (pageEventNames.includes(name)) {
          if (scope) {
            return ctx.addPageEventHandle(scope, name, listener);
          }
          return false;
        }
        return ctx.addLifetimeListener(scope, name, listener);
      },
    };
  }
  return null;
}
