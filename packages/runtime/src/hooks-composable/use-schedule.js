import { onMounted, onUnmounted } from '../hooks/lifetime-scope.js';
export default function useSchedule(task, config = {}) {
  if (typeof config === 'number') config = { interval: config };
  const interval = Math.max(1, Math.floor(config.interval ?? 1000));
  const times = Math.max(0, Math.floor(config.times ?? 1));
  let remaining = times, timer = null, disposed = false;
  const clear = () => { clearTimeout(timer); timer = null; };
  const step = () => {
    timer = null;
    if (disposed) return;
    task();
    if (times && --remaining <= 0) return;
    timer = setTimeout(step, interval);
  };
  const run = () => {
    if (disposed || timer !== null) return;
    remaining = times;
    if (config.immediate) step();
    else timer = setTimeout(step, interval);
  };
  onMounted(run);
  onUnmounted(() => { disposed = true; clear(); });
  clear.restart = () => { clear(); run(); };
  return clear;
}
