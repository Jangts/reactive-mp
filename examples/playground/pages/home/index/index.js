/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
import {
  definePage,
  onMounted,
  useSignal,
} from '../../../vendor/reactive-mp/src/index.js';
definePage(() => {
  const [name, setGreeting] = useSignal('');

  onMounted(() => {
    setGreeting('world');
  });
  return { name };
});
