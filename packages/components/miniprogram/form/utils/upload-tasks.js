/** 文件任务队列：稳定顺序、限额、取消、重试与适配器隔离；不访问平台。 */
import { clone } from './value-path.js';
export function createUploadQueue(options) {
  const tasks = new Map();
  const order = new Map();
  let sequence = 0;
  let dead = false;
  const emit = (name, detail) => {
    if (!dead) {
      options.emit?.(name, clone(detail));
    }
  };
  const props = () => options.getProps?.() ?? {};
  function publish() {
    if (dead) {
      return;
    }
    options.onPending?.(
      [...tasks.values()].some(
        (task) => task.status !== 'success' && task.status !== 'cancelled',
      ),
    );
    options.onChange?.(
      [...tasks.values()].map(
        ({ file, status, progress, message, attempt }) => ({
          ...clone(file),
          status,
          progress,
          message,
          attempt,
        }),
      ),
    );
  }
  function commit(file) {
    const values = options.getValues() ?? [];
    const next = [
      ...values.filter((value) => value.id !== file.id),
      clone(file),
    ];
    next.forEach((value) => {
      if (!order.has(value.id)) {
        order.set(value.id, sequence++);
      }
    });
    next.sort((a, b) => order.get(a.id) - order.get(b.id));
    options.commit(next);
  }
  async function run(task) {
    if (dead || task.status === 'cancelled') {
      return;
    }
    const token = {};
    task.token = token;
    const current = () =>
      !dead && tasks.get(task.file.id) === task && task.token === token;
    task.status = 'uploading';
    task.progress = 0;
    task.attempt++;
    publish();
    emit('uploadstart', { file: task.file, attempt: task.attempt });
    let cancel;
    const cancelled = new Promise((resolve) => {
      cancel = () => resolve(null);
    });
    task.cancel = cancel;
    try {
      const handle = options.getAdapter()(clone(task.file), {
        onProgress(percent) {
          if (current()) {
            task.progress = Math.max(0, Math.min(100, Number(percent) || 0));
            publish();
            emit('progress', { id: task.file.id, progress: task.progress });
          }
        },
      });
      task.abort = handle.abort;
      const result = await Promise.race([handle.result, cancelled]);
      if (!current() || !result) {
        return;
      }
      if (typeof result.url !== 'string' || !result.url) {
        throw new Error('Upload adapter must return a URL');
      }
      task.file = { ...task.file, ...result };
      task.status = 'success';
      task.progress = 100;
      commit(task.file);
      publish();
      emit('uploadsuccess', { file: task.file });
    } catch (error) {
      if (!current()) {
        return;
      }
      task.status = 'error';
      task.message = error.message || 'Upload failed';
      if (task.attempt <= (props().retryCount ?? 0)) {
        return run(task);
      }
      publish();
      emit('uploaderror', { file: task.file, message: task.message });
    }
  }
  function cancelTask(task) {
    task.token = null;
    task.status = 'cancelled';
    task.cancel?.();
    try {
      task.abort?.();
    } catch (error) {
      emit('uploaderror', { file: task.file, message: error.message });
    }
  }
  return {
    async add(files) {
      if (dead) {
        return;
      }
      const config = props();
      const adapter = options.getAdapter();
      const jobs = [];
      const initial = options.getValues() ?? [];
      initial.forEach((file) => {
        if (!order.has(file.id)) {
          order.set(file.id, sequence++);
        }
      });
      const occupied = new Map([
        ...initial.map((file) => [file.id, file]),
        ...[...tasks.values()].map((task) => [task.file.id, task.file]),
      ]);
      for (const raw of files) {
        const file = { ...clone(raw), id: raw.id ?? `file-${++sequence}` };
        const limit = config.typeLimits?.[file.type] ?? {};
        const typeCount = [...occupied.values()].filter(
          (value) => value.type === file.type,
        ).length;
        const allowed =
          (config.accept ?? ['image']).includes(file.type) &&
          occupied.size < (config.maxCount ?? 9) &&
          (limit.maxCount == null || typeCount < limit.maxCount) &&
          (!(limit.maxSize ?? config.maxSize) ||
            file.size <= (limit.maxSize ?? config.maxSize));
        if (!allowed) {
          emit('uploaderror', {
            file,
            message: 'File type, size or count exceeds the configured limit',
          });
          continue;
        }
        if (occupied.has(file.id)) {
          emit('uploaderror', { file, message: 'Duplicate file id' });
          continue;
        }
        occupied.set(file.id, file);
        order.set(file.id, sequence++);
        emit('select', { file });
        if (!adapter) {
          commit(file);
          continue;
        }
        const task = {
          file,
          status: 'selected',
          progress: 0,
          attempt: 0,
          message: '',
        };
        tasks.set(file.id, task);
        if (config.autoUpload !== false) {
          jobs.push(run(task));
        }
      }
      publish();
      await Promise.all(jobs);
    },
    upload: () =>
      Promise.all(
        [...tasks.values()]
          .filter(
            (task) => task.status === 'selected' || task.status === 'error',
          )
          .map(run),
      ),
    retry(id) {
      const task = tasks.get(id);
      if (task?.status === 'error') {
        return run(task);
      }
      return Promise.resolve();
    },
    remove(id) {
      const task = tasks.get(id);
      if (task) {
        cancelTask(task);
        tasks.delete(id);
      }
      options.commit(
        (options.getValues() ?? []).filter((file) => file.id !== id),
      );
      publish();
      emit('remove', { id });
    },
    reset() {
      for (const task of tasks.values()) {
        cancelTask(task);
      }
      tasks.clear();
      order.clear();
      publish();
    },
    dispose() {
      dead = true;
      for (const task of tasks.values()) {
        cancelTask(task);
      }
      tasks.clear();
      order.clear();
    },
  };
}
