/** 原生开发宿主的 hooks 场景，用于交互复现与核心包联调。 */

import {
  useSignal,
  watch,
  watchEffect,
  computed,
  onUnmounted,
  onMounted,
} from '../../vendor/reactive-mp/src/index.js';

export const useCounter = (init = 1, step = 1) => {
  let timer;
  const [count, setCount] = useSignal(init);

  onMounted(() => {
    console.log('onMounted');
    timer = setInterval(() => {
      setCount(count() + step);
    }, 4000);
  });

  onUnmounted(() => {
    console.log('onUnmounted');
    if (timer) {
      clearInterval(timer);
    }
  });

  return count;
};

export const useWatches = () => {
  const [count, setCount] = useSignal(1);
  const double = computed(() => count() * 2, {});

  watch(
    [double],
    ([val]) => {
      console.log('watch double', val);
    },
    { immediate: true },
  );
};
