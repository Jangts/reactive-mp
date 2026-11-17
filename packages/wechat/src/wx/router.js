/** 微信路由与显式 tab 配置；不读取 __wxConfig，也不持有页面实例。 */
import { appendQuery } from '../query.js';
import { callWechat, toWechatError, WechatError } from '../result.js';

/** 解析小程序内部路径；path 统一保留前导斜线，纯解析错误抛 TypeError。 */
export function formatRoute(route, tabRoutes = []) {
  const source = typeof route === 'string' ? route : route?.path;
  if (
    typeof source !== 'string' ||
    !source ||
    /[#:]/.test(source.split('?')[0])
  ) {
    throw new TypeError('A mini program page path is required');
  }
  const url = appendQuery(source, typeof route === 'object' ? route.query : {});
  const [rawPath] = url.split('?');
  const path = '/' + rawPath.replace(/^\/+/, '');
  if (path === '/') {
    throw new TypeError('A mini program page path is required');
  }
  const normalizedUrl = path + url.slice(rawPath.length);
  return {
    url: normalizedUrl,
    path,
    query: normalizedUrl.includes('?')
      ? normalizedUrl.slice(normalizedUrl.indexOf('?') + 1)
      : '',
    isTabRoute: tabRoutes.some(
      (item) => '/' + item.replace(/^\/+/, '') === path,
    ),
  };
}

/** 创建独立路由器；navigateTo/redirectTo 对已配置 tab 页转用 switchTab。 */
export function createRouter({ tabRoutes = [] } = {}) {
  const tabs = [...tabRoutes];
  function navigate(api, route, events) {
    try {
      const target = formatRoute(route, tabs);
      const useTab =
        target.isTabRoute && (api === 'navigateTo' || api === 'redirectTo');
      const method = useTab ? 'switchTab' : api;
      if (method === 'switchTab' && target.url.includes('?')) {
        throw new WechatError('switchTab does not accept query parameters', {
          api: method,
          code: 'INVALID_ARGUMENT',
        });
      }
      return callWechat(method, { url: target.url, events });
    } catch (error) {
      return Promise.resolve([
        false,
        toWechatError(error, api, 'INVALID_ARGUMENT'),
      ]);
    }
  }
  return {
    navigateTo: (route, events) => navigate('navigateTo', route, events),
    redirectTo: (route) => navigate('redirectTo', route),
    switchTab: (route) => navigate('switchTab', route),
    reLaunch: (route) => navigate('reLaunch', route),
    navigateBack: (delta = 1) => callWechat('navigateBack', { delta }),
  };
}

const router = createRouter();
export const wxNavigateTo = router.navigateTo;
export const wxRedirectTo = router.redirectTo;
export const wxSwitchTab = router.switchTab;
export const wxReLaunch = router.reLaunch;
export const wxNavigateBack = router.navigateBack;
