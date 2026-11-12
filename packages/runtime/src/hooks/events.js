/** 平台事件、返回值回调及 App Hook 的组合式入口。 */
import { requireSetupContext } from './context.js';

/**
 * @typedef {{windowWidth: number; windowHeight: number;}} PageSize 打开当前页面路径中的参数
 * @typedef {{size: PageSize}} PageResizePayload 打开当前页面路径中的参数
 */
/**
 * [ onPageResize ] 页面尺寸改变时触发；组件所在的页面尺寸变化时执行。
 *
 * Map to: Page/onResize, Component/pageLifetimes/resize
 *
 * @param {EventHandle<PageResizePayload>} handle 生命周期处理函数
 */
export function onPageResize(handle) {
  requireSetupContext().on('resize', handle);
}

/**
 * [ onComponentError ] 当组件方法抛出错误时执行
 *
 * Map to: Component/lifetimes/error, Component/error
 *
 * @param {EventHandle<Error>} handle 生命周期处理函数
 */
export function onComponentError(handle) {
  requireSetupContext().on('error', handle);
}

/**
 * [ onPullDownRefresh ] 监听用户下拉刷新事件
 *
 * Map to: Page/onPullDownRefresh
 *
 * @param {() => void} handle
 */
export function onPullDownRefresh(handle) {
  requireSetupContext().on('PullDownRefresh', handle);
}

/**
 * [ onReachBottom ] 监听用户上拉触底事件
 *
 * Map to: Page/onReachBottom
 *
 * @param {() => void} handle
 */
export function onReachBottom(handle) {
  requireSetupContext().on('ReachBottom', handle);
}

/**
 * [ onPageScroll ] 监听用户滑动页面事件
 *
 * Map to: Page/onPageScroll
 *
 * @param {EventHandle<PageScrollEvent>} handle
 */
export function onPageScroll(handle) {
  requireSetupContext().on('PageScroll', handle);
}

/**
 * [ onTabItemTap ] 点击 tab 时触发
 *
 * Map to: Page/onTabItemTap
 *
 * @param {EventHandle<TabItemTapEvent>} handle
 */
export function onTabItemTap(handle) {
  requireSetupContext().on('TabItemTap', handle);
}

export function onShareAppMessage(handle) {
  return requireSetupContext().on('ShareAppMessage', handle);
}
export function onShareTimeline(handle) {
  return requireSetupContext().on('ShareTimeline', handle);
}
export function onAddToFavorites(handle) {
  return requireSetupContext().on('AddToFavorites', handle);
}
export function onSaveExitState(handle) {
  return requireSetupContext().on('SaveExitState', handle);
}

/** 应用初始化回调，仅在 defineApp 的同步 setup 中登记。 */
export function onLaunch(handle) {
  return requireSetupContext().on('launch', handle);
}
/** 应用脚本错误回调。 */
export function onAppError(handle) {
  return requireSetupContext().on('appError', handle);
}
/** 应用页面不存在回调。 */
export function onPageNotFound(handle) {
  return requireSetupContext().on('pageNotFound', handle);
}
/** 应用未处理的 Promise 拒绝回调。 */
export function onUnhandledRejection(handle) {
  return requireSetupContext().on('unhandledRejection', handle);
}
/** 应用主题变化回调。 */
export function onThemeChange(handle) {
  return requireSetupContext().on('themeChange', handle);
}
