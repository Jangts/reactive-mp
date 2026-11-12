/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
export * from './hooks/index.js';
export * from './etc/setup-app-tools.js';
export {
  defineApp,
  definePage,
  defineComponent,
  defineComponentPage,
  useSetupApp,
} from './main.js';
export * from './hooks-composable/index.js';
