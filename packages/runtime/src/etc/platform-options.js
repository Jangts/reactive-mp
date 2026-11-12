/** 将统一实例作用域接到原生页面／组件回调；返回值回调保留直接调用语义。 */
import { pageLifetimeMap, pageEventNames, pageHookNames } from './constants.js';

/** 修改已收集的配置，登记平台入口；实例只在回调执行时查找。 */
export function attachPlatformOptions(
  runtime,
  options,
  native,
  ctx,
  isComponent,
  pageRole,
  getScope,
) {
  if (isComponent) {
    // created is forwarded by the setup behavior, once, after setup wiring.
    options.lifetimes.created = function () {};
    options.lifetimes.attached = function () {
      getScope(this)
        ?.forwardInstanceLifetimeEvent('attached')
        .emit('scopelifetimes/mounted');
    };
    options.lifetimes.beforeDetach = function () {
      getScope(this)?.forwardInstanceLifetimeEvent('beforeDetach');
    };
    options.lifetimes.detached = function () {
      const scope = getScope(this);
      try {
        scope?.stop();
      } finally {
        runtime.setComponentScope(this, null);
        if (pageRole) {
          runtime.setPageScope(scope?.pageId, null);
        }
      }
    };
    if (pageRole) {
      for (const [lifetime, [name]] of pageLifetimeMap) {
        options.methods[name] = function (...args) {
          if (lifetime === 'unload') {
            getScope(this)?.forwardInstanceLifetimeEvent('unload', ...args);
          } else {
            getScope(this)?.forwardInstanceLifetimeEvent(lifetime, ...args);
          }
        };
      }
    }
  } else {
    for (const [lifetime, [name]] of pageLifetimeMap) {
      options[name] = function (...args) {
        const scope = getScope(this);
        if (lifetime === 'unload') {
          try {
            scope?.stop();
          } finally {
            runtime.setPageScope(this.getPageId(), null);
          }
        } else {
          scope?.forwardInstanceLifetimeEvent(lifetime, ...args);
          if (lifetime === 'load') {
            scope?.emit('scopelifetimes/mounted');
          }
        }
      };
    }
    for (const event of pageEventNames) {
      options[`on${event}`] = function (...args) {
        return getScope(this)?.context.forwardPageEvent(
          getScope(this),
          event,
          ...args,
        );
      };
    }
  }
  // Return-valued platform hooks are direct calls, never EventBus broadcasts.
  if (pageRole) {
    for (const event of pageHookNames) {
      const name = `on${event}`;
      const target = isComponent ? options.methods : options;
      const fallback = isComponent ? native.methods?.[name] : native[name];
      if (typeof target[name] === 'function' || ctx.setupPageHooks.has(event)) {
        target[name] = function (...args) {
          return getScope(this)?.context.invokePageHook(
            event,
            fallback,
            ...args,
          );
        };
      }
    }
  }

  // Component 页面也必须在注册时拥有这些方法入口，不能仅修改实例属性。
  if (isComponent && pageRole) {
    for (const event of pageEventNames) {
      options.methods[`on${event}`] = function (...args) {
        const scope = getScope(this);
        return scope?.context.forwardPageEvent(scope, event, ...args);
      };
    }
  }
}
