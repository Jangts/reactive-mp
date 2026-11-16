/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
import {
  definePage,
  useSignal,
  computed,
  watch,
  onMounted,
  onUnmounted,
  onShareAppMessage,
} from '../../vendor/reactive-mp/src/index.js';
let active = 0;
definePage(
  ({ provide }) => {
    const [count, setCount] = useSignal(0);
    const [status, setStatus] = useSignal('waiting');
    const double = computed(() => count() * 2);
    provide('counter', count);
    watch(count, (value) => setStatus(`watch: ${value}`));
    onMounted(() => {
      active++;
      setStatus(`mounted; active pages: ${active}`);
    });
    onUnmounted(() => {
      active--;
      console.info('integration page disposed; active:', active);
    });
    onShareAppMessage(() => ({
      title: `Counter ${count()}`,
      path: '/pages/index/index',
    }));
    return {
      openMixedPage: () => wx.navigateTo({ url: '/pages/mixed/index' }),
      openBehaviorPage: () => wx.navigateTo({ url: '/pages/behavior/index' }),
      openComponentPage: () => wx.navigateTo({ url: '/pages/component/index' }),
      count,
      double,
      status,
      increment: () => setCount(count() + 1),
      reset: () => setCount(0),
    };
  },
  {
    onReady() {
      console.info('native ready retained');
    },
  },
);
