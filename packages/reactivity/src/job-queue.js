/** 响应式刷新队列：同批去重并允许收敛的回写，拒绝持续自激的更新环。 */
import { scheduleMicrotask } from '@reactive-mp/shared';
const jobs = new Set();
let scheduled = false;
let flushing = false;
// 这是错误循环检测，不是业务更新次数配额；下一批刷新重新计数。
const maxRunsPerFlush = 100;

/** 在同一批内递增处理新任务；一个任务失败仍释放队列并执行独立任务。 */
export function flushJobs() {
  if (flushing) {
    return;
  }
  scheduled = false;
  flushing = true;
  const counts = new Map();
  const errors = [];
  try {
    while (jobs.size) {
      const batch = [...jobs];
      jobs.clear();
      for (const job of batch) {
        const count = (counts.get(job) ?? 0) + 1;
        counts.set(job, count);
        if (count > maxRunsPerFlush) {
          if (count === maxRunsPerFlush + 1) {
            errors.push(Error('reactive update cycle did not converge'));
          }
          continue;
        }
        try {
          job();
        } catch (error) {
          errors.push(error);
        }
      }
    }
  } finally {
    flushing = false;
  }
  if (errors.length === 1) {
    throw errors[0];
  }
  if (errors.length) {
    throw new AggregateError(errors, 'reactive jobs failed');
  }
}

/** 合并同一处理函数；正在刷新的任务可登记下一次执行以支持状态归一化。 */
export function queueJob(job) {
  jobs.add(job);
  if (!scheduled && !flushing) {
    scheduled = true;
    scheduleMicrotask(flushJobs);
  }
}
