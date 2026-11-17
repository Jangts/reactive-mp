/** 单个宿主的批次、超时和节点生命周期；Promise 与定时器只存在于逻辑层。 */
import { imagePool } from './image-pool.js';

/** 创建宿主控制器；publish 只接收可序列化的活动图片列表。 */
export function createImagesPreloader(publish, pool = imagePool) {
  const jobs = new Map();
  const requests = new Set();
  let ready = false;
  let disposed = false;

  /** 节点增删由池的所有权驱动，卸载阶段停止向视图写入。 */
  function render(job, active) {
    if (active) {
      jobs.set(job.id, job);
    } else {
      jobs.delete(job.id);
    }
    if (!disposed) {
      publish([...jobs.values()]);
    }
  }

  /** 每个调用项独立计时和结算，释放租约不会取消其他批次的等待。 */
  function request(src, { delay, timeout }) {
    return new Promise((resolve) => {
      let lease;
      let timer;
      let finished = false;
      function finish(result) {
        if (finished) {
          return;
        }
        finished = true;
        clearTimeout(timer);
        requests.delete(task);
        lease?.release();
        resolve({ ...result });
      }
      const task = {
        start() {
          if (lease || finished) {
            return;
          }
          lease = pool.acquire(src, render);
          lease.promise.then(finish);
          if (timeout > 0) {
            timer = setTimeout(
              () => finish({ src, status: 'timeout' }),
              timeout,
            );
          }
        },
        cancel: () => finish({ src, status: 'cancelled' }),
      };
      requests.add(task);
      if (disposed) {
        task.cancel();
      } else if (!delay || ready) {
        task.start();
      }
    });
  }

  return {
    /** 忽略空项；重复 URL 共享加载，但仍按输入项计数。参数错误拒绝 Promise。 */
    async loadImages(images, { delay = false, timeout = 0 } = {}) {
      if (!Array.isArray(images)) {
        throw new TypeError('loadImages: images must be an array');
      }
      if (
        typeof delay !== 'boolean' ||
        !Number.isFinite(timeout) ||
        timeout < 0
      ) {
        throw new TypeError(
          'loadImages: delay must be boolean; timeout must be finite and >= 0',
        );
      }
      const urls = images.filter(
        (src) => typeof src === 'string' && src.trim(),
      );
      const results = await Promise.all(
        urls.map((src) => request(src, { delay, timeout })),
      );
      const done = results.filter(
        (result) => result.status === 'loaded',
      ).length;
      return {
        total: results.length,
        done,
        fail: results.length - done,
        results,
      };
    },
    ready() {
      if (disposed) {
        return;
      }
      ready = true;
      for (const task of requests) {
        task.start();
      }
    },
    dispose() {
      if (disposed) {
        return;
      }
      disposed = true;
      for (const task of requests) {
        task.cancel();
      }
      jobs.clear();
    },
    onImageLoad(event) {
      if (!disposed) {
        const { width, height } = event.detail;
        pool.settle(Number(event.currentTarget.dataset.id), {
          status: 'loaded',
          width,
          height,
        });
      }
    },
    onImageError(event) {
      if (!disposed) {
        pool.settle(Number(event.currentTarget.dataset.id), {
          status: 'error',
          errMsg: event.detail?.errMsg ?? 'image load failed',
        });
      }
    },
  };
}
