import { runInEffectFreeScope } from '@reactive-mp/reactivity';
import { createSetupBehavior } from './etc/behaviors.js';
import { exposeActiveSetupContext } from './etc/exposers.js';
import { formatSetupOptions } from './etc/formatters.js';
import { pageLifetimeMap, pageEventNames, pageHookNames } from './etc/constants.js';
import RuntimeContext from './SetupRuntimeContext.js';
import OptionsSetupContext from './setup-context/OptionsSetupContext.js';

const CONTEXT = new RuntimeContext();

function register(setup, native, role) {
  const isComponent = role !== 'page';
  const ctx = new OptionsSetupContext({
    isPage: role !== 'component', isComponent,
    nativeProperties: native.properties,
  });
  return CONTEXT.withSetupContext(ctx, () => {
    try {
      runInEffectFreeScope(() => CONTEXT.runSetup(setup, ctx));
      const pageRole = ctx.isPage;
      if (isComponent && pageRole) role = 'component-page';
      const properties = isComponent ? ctx.createPropertiesOption(native) : undefined;
      const observers = ctx.createObserversOption(native.observers);
      const { data, methods } = ctx.formatDataAndMethods(
        native.data, isComponent ? native.methods : native
      );
      const lifetimes = isComponent ? ctx.createLifetimeOptions(native) : {};
      const options = ctx.formatOptions({
        ...native, ...(isComponent ? { properties, methods, observers, ...lifetimes } : methods), data,
      });
      delete options.setup;
      // Page's data/options are configuration, not callable methods.
      const callbacks = isComponent ? { ...native, properties, methods: { ...methods } } : methods;
      const behavior = createSetupBehavior(CONTEXT, setup, callbacks, role, isComponent ? {} : observers);
      options.behaviors = [behavior, ...options.behaviors];
      const getScope = instance => isComponent
        ? CONTEXT.getComponentScope(instance)
        : CONTEXT.getPageScope(instance.getPageId());
      if (isComponent) {
        // created is forwarded by the setup behavior, once, after setup wiring.
        options.lifetimes.created = function () {};
        options.lifetimes.attached = function () {
          getScope(this)?.forwardInstanceLifetimeEvent('attached').emit('scopelifetimes/mounted');
        };
        options.lifetimes.detached = function () {
          const scope = getScope(this);
          try { scope?.stop(); } finally {
            CONTEXT.setComponentScope(this, null);
            if (pageRole) CONTEXT.setPageScope(scope?.pageId, null);
          }
        };
        if (pageRole) {
          for (const [lifetime, [name]] of pageLifetimeMap) {
            options.methods[name] = function (...args) {
              if (lifetime === 'unload') getScope(this)?.forwardInstanceLifetimeEvent('unload', ...args);
              else getScope(this)?.forwardInstanceLifetimeEvent(lifetime, ...args);
            };
          }
        }
      } else {
        for (const [lifetime, [name]] of pageLifetimeMap) {
          options[name] = function (...args) {
            const scope = getScope(this);
            if (lifetime === 'unload') {
              try { scope?.stop(); } finally { CONTEXT.setPageScope(this.getPageId(), null); }
            } else {
              scope?.forwardInstanceLifetimeEvent(lifetime, ...args);
              if (lifetime === 'load') scope?.emit('scopelifetimes/mounted');
            }
          };
        }
        for (const event of pageEventNames) {
          options[`on${event}`] = function (...args) {
            return getScope(this)?.context.forwardPageEvent(getScope(this), event, ...args);
          };
        }
      }
      // Return-valued platform hooks are direct calls, never EventBus broadcasts.
      if (pageRole) for (const event of pageHookNames) {
        const name = `on${event}`;
        const target = isComponent ? options.methods : options;
        const fallback = isComponent ? native.methods?.[name] : native[name];
        if (typeof target[name] === 'function' || ctx.setupPageHooks.has(event)) {
          target[name] = function (...args) {
            return getScope(this)?.context.invokePageHook(event, fallback, ...args);
          };
        }
      }
      (isComponent ? Component : Page)(options);
    } finally { ctx.reset(); }
  });
}

export const useSetupApp = () => CONTEXT.getAppSetupRecords();
export const useActiveSetupContext = () => exposeActiveSetupContext(CONTEXT);
export function defineApp(setup) {
  const { globalData, setupMethods } = CONTEXT.runAppSetup(setup).formatDataAndMethods();
  App({ ...setupMethods, globalData });
}
export function definePage(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  register(fn, native, 'page');
}
export function defineComponent(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  register(fn, native, 'component');
}
export function defineComponentPage(setup, options) {
  const { setup: fn, ...native } = formatSetupOptions(setup, options);
  register(fn, native, 'component-page');
}
