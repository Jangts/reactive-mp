/** 注册定义的收集与装配：只执行一次无订阅收集，实例由 setup Behavior 建立。 */
import { runInEffectFreeScope } from '@reactive-mp/reactivity';
import { createSetupBehavior } from './etc/behaviors.js';
import { attachPlatformOptions } from './etc/platform-options.js';
import OptionsSetupContext from './setup-context/OptionsSetupContext.js';

/** 收集并注册原生定义；正常和失败路径均恢复调用者上下文。 */
export function registerDefinition(runtime, setup, native, role) {
  const isComponent = role !== 'page';
  const ctx = new OptionsSetupContext({
    isPage: role !== 'component',
    isComponent,
    nativeProperties: native.properties,
    nativeOptions: native.options,
  });
  return runtime.withSetupContext(ctx, () => {
    try {
      runInEffectFreeScope(() => runtime.runSetup(setup, ctx));
      const pageRole = ctx.isPage;
      if (isComponent && pageRole) {
        role = 'component-page';
      }
      const properties = isComponent
        ? ctx.createPropertiesOption(native)
        : undefined;
      const observers = ctx.createObserversOption(native.observers);
      const { data, methods } = ctx.formatDataAndMethods(
        native.data,
        isComponent ? native.methods : native,
      );
      const lifetimes = isComponent ? ctx.createLifetimeOptions(native) : {};
      const options = ctx.formatOptions({
        ...native,
        ...(isComponent
          ? { properties, methods, observers, ...lifetimes }
          : methods),
        data,
      });
      delete options.setup;
      // Page's data/options are configuration, not callable methods.
      const callbacks = isComponent
        ? {
            ...native,
            options: options.options,
            properties,
            methods: { ...methods },
          }
        : { ...methods, options: options.options };
      const behavior = createSetupBehavior(
        runtime,
        setup,
        callbacks,
        role,
        isComponent ? {} : observers,
      );
      options.behaviors = [behavior, ...options.behaviors];
      const getScope = (instance) =>
        isComponent
          ? runtime.getComponentScope(instance)
          : runtime.getPageScope(instance.getPageId());
      attachPlatformOptions(
        runtime,
        options,
        native,
        ctx,
        isComponent,
        pageRole,
        getScope,
      );
      (isComponent ? Component : Page)(options);
    } finally {
      ctx.reset();
    }
  });
}
