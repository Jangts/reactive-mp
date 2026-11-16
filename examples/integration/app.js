/** 原生开发宿主的 app 场景，用于交互复现与核心包联调。 */
App({
  globalData: {
    validationHost: 'integration',
    mixedActive: 0,
    mixedLoads: { native: 0, hook: 0 },
  },
});
