/** 文件选择和上传状态的宿主装配；网络与预览通过适配器或事件接入。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { onUnmounted } from '@reactive-mp/runtime';
import { useField } from './use-field.js';
import { withDefaults } from '../utils/properties.js';
import { createUploadQueue } from '../utils/upload-tasks.js';
import { equal } from '../utils/value-path.js';
export function useUpload(props = {}, options = {}) {
  const field = useField(withDefaults(props, { defaultValue: [] }), options);
  const [tasks, setTasks] = useSignal([]);
  let adapter = options.adapter;
  let committed = field.value();
  const queue = createUploadQueue({
    getProps: () => props,
    getAdapter() {
      const resolved =
        adapter ??
        (props.adapter ? field.form.getUploadAdapter(props.adapter) : null);
      if (props.adapter && !resolved) {
        throw new Error(`Unknown upload adapter: ${props.adapter}`);
      }
      return resolved;
    },
    getValues: () => field.value() ?? [],
    commit(value) {
      committed = value;
      field.form.setFieldValue(field.path, value, 'upload');
      field.emit('change', { value, source: 'upload', path: field.path });
      void field.form.validateField(field.path, { event: 'change' });
    },
    emit: field.emit,
    onChange: setTasks,
    onPending: field.setPending,
  });
  watch(field.value, (value) => {
    if (!equal(value, committed)) {
      committed = value;
      queue.reset();
    }
  });
  let stopReset = () => {};
  watch(
    () => field.form,
    (form) => {
      stopReset();
      stopReset = form.onReset(queue.reset);
    },
    { immediate: true },
  );
  onUnmounted(() => {
    stopReset();
    queue.dispose();
  });
  const files = computed(() => {
    const values = field.value() ?? [];
    const byId = new Map(
      values.map((file) => [file.id, { ...file, status: 'success' }]),
    );
    for (const task of tasks()) {
      byId.set(task.id, task);
    }
    return [...byId.values()];
  });
  return {
    ...field,
    files,
    upload: queue.upload,
    retry: queue.retry,
    remove: queue.remove,
    addFiles: queue.add,
    setAdapter: (value) => {
      adapter = value;
    },
    async choose() {
      if (field.fieldDisabled() || field.fieldReadonly()) {
        return;
      }
      try {
        const result = await new Promise((resolve, reject) =>
          wx.chooseMedia({
            count: Math.max(1, (props.maxCount ?? 9) - files().length),
            mediaType: props.accept ?? ['image'],
            sizeType: ['compressed', 'original'],
            success: resolve,
            fail: reject,
          }),
        );
        await queue.add(
          result.tempFiles.map((file) => ({
            type: file.fileType,
            tempFilePath: file.tempFilePath,
            size: file.size,
            poster: file.thumbTempFilePath,
          })),
        );
      } catch (error) {
        if (!/cancel/i.test(error.errMsg ?? '')) {
          field.emit('error', {
            type: 'selection',
            message: error.message ?? error.errMsg,
          });
        }
      }
    },
    onRemove: (event) => {
      if (!field.fieldDisabled() && !field.fieldReadonly()) {
        queue.remove(event.currentTarget.dataset.id);
      }
    },
    onRetry: (event) => {
      if (!field.fieldDisabled() && !field.fieldReadonly()) {
        return queue.retry(event.currentTarget.dataset.id);
      }
    },
    onPreview: (event) =>
      field.emit('preview', {
        file: files().find(
          (file) => file.id === event.currentTarget.dataset.id,
        ),
      }),
  };
}
