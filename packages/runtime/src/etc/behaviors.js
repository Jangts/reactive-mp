import { pageLifetimeMap } from './constants.js';
import createInstanceLifetimeScope from '../InstanceLifetimeScope.js';

// Each registration owns its behavior closure. Runtime functions never enter data.
export function createSetupBehavior(runtime, setup, nativeOptions, role, observers = {}) {
  const pageRegistration = role === 'page';
  const pageRole = role !== 'component';
  const scopes = new WeakMap();
  return Behavior({
    observers,
    lifetimes: {
      created() {
        const scope = createInstanceLifetimeScope(this, {
          isPage: pageRole, isComponent: !pageRegistration,
        });
        scopes.set(this, scope);
        if (pageRole) runtime.setPageScope(scope.pageId, scope);
        if (!pageRegistration) runtime.setComponentScope(this, scope);
        scope.context.nativeProperties = nativeOptions.properties;
        try {
          runtime.withInstanceScope(scope, () => scope.run((ctx) => {
            runtime.runSetup(setup, ctx);
            runtime.withSetupContext(ctx, () => {
              if (pageRegistration) {
                ctx.mountPageLifetimeHandles(scope, nativeOptions);
                ctx.mountPageEventHandle(scope, nativeOptions);
              } else {
                ctx.registerComponentLifetimeListener(scope, nativeOptions);
                if (pageRole) {
                  for (const [lifetime, [name]] of pageLifetimeMap) {
                    ctx.addLifetimeListener(scope, lifetime, nativeOptions.methods?.[name]);
                  }
                  ctx.mountPageEventHandle(scope, nativeOptions.methods || {});
                }
              }
            });
          }));
          scope.forwardInstanceLifetimeEvent('created');
        } catch (error) {
          try { scope.stop(); } finally {
            scopes.delete(this);
            if (pageRole) runtime.setPageScope(scope.pageId, null);
            if (!pageRegistration) runtime.setComponentScope(this, null);
          }
          throw error;
        }
      },
      attached() {
        const scope = scopes.get(this);
        scope.context.activateView();
        scope.attachTo(pageRegistration ? null : runtime.getParentScopeOf(scope));
      },
    },
  });
}
