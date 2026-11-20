/** 共用既有 VitePress 默认主题与品牌样式，记住用户主动选择的语言。 */
import DefaultTheme from 'vitepress/theme';
import './style.css';
export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof document === 'undefined') {
      return;
    }
    router.onAfterRouteChanged = (route) => {
      const locale = /\/(zh|en)\//.exec(route)?.[1];
      if (locale) {
        try {
          localStorage.setItem('reactive-mp-docs-language', locale);
        } catch {
          // 隐私模式仍可通过链接切换语言。
        }
      }
    };
  },
};
