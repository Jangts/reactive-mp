/** 图片请求池拥有进行中的共享请求和有界尺寸缓存；原生节点由订阅者提供。 */
export function createImagePool(maxEntries = 256) {
  const cache = new Map();
  const pending = new Map();
  const jobs = new Map();
  let nextId = 0;

  /** 命中时更新最近使用顺序，返回副本，避免外部修改共享尺寸。 */
  function getSize(src) {
    const size = cache.get(src);
    if (!size) {
      return {};
    }
    cache.delete(src);
    cache.set(src, size);
    return { ...size };
  }

  /** 同一时刻只让一个订阅者渲染节点；转移所有者时使用新身份隔离旧事件。 */
  function assignOwner(entry, owner) {
    entry.owner = owner;
    entry.job = { id: ++nextId, src: entry.src };
    jobs.set(entry.job.id, entry);
    owner.render(entry.job, true);
  }

  /** 获取共享请求的租约。释放最后一个订阅时移除节点并结算，失败可再次请求。 */
  function acquire(src, render) {
    if (cache.has(src)) {
      return {
        promise: Promise.resolve({ src, status: 'loaded', ...getSize(src) }),
        release() {},
      };
    }
    let entry = pending.get(src);
    if (!entry) {
      let resolve;
      const promise = new Promise((done) => {
        resolve = done;
      });
      entry = { src, promise, resolve, subscribers: new Set() };
      pending.set(src, entry);
    }
    const subscriber = { render };
    entry.subscribers.add(subscriber);
    if (!entry.owner) {
      assignOwner(entry, subscriber);
    }
    return {
      promise: entry.promise,
      release() {
        if (
          !entry.subscribers.delete(subscriber) ||
          entry.owner !== subscriber
        ) {
          return;
        }
        // 同一宿主仍有等待时保留节点，避免一个批次超时迫使其他批次重新加载。
        const sameHost = [...entry.subscribers].find(
          (next) => next.render === subscriber.render,
        );
        if (sameHost) {
          entry.owner = sameHost;
          return;
        }
        jobs.delete(entry.job.id);
        subscriber.render(entry.job, false);
        entry.owner = undefined;
        const next = entry.subscribers.values().next().value;
        if (next) {
          assignOwner(entry, next);
        } else {
          pending.delete(src);
          entry.resolve({ src, status: 'cancelled' });
        }
      },
    };
  }

  /** 只接受当前节点身份的结果；终态先释放节点，再通知所有批次。 */
  function settle(id, result) {
    const entry = jobs.get(id);
    if (!entry) {
      return;
    }
    jobs.delete(id);
    pending.delete(entry.src);
    if (result.status === 'loaded') {
      cache.delete(entry.src);
      cache.set(entry.src, { width: result.width, height: result.height });
      if (cache.size > maxEntries) {
        cache.delete(cache.keys().next().value);
      }
    }
    entry.subscribers.clear();
    entry.owner.render(entry.job, false);
    entry.resolve({ src: entry.src, ...result });
  }

  return {
    acquire,
    settle,
    getSize,
    clear(src) {
      if (src === undefined) {
        cache.clear();
      } else {
        cache.delete(src);
      }
    },
  };
}

// 包内共享元数据和进行中的请求；不保存图片文件或原生组件实例。
export const imagePool = createImagePool();

/** 同步查询成功预加载的原始尺寸；未命中返回空对象，不发起网络请求。 */
export function getLoadedImageSizeByUrl(src) {
  return imagePool.getSize(src);
}

/** 清除一个 URL 或全部成功记录；进行中的请求不受影响。 */
export function clearImageCache(src) {
  imagePool.clear(src);
}
