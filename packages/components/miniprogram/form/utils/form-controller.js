/** 实例表单控制器：唯一模型、字段所有权、规则任务与提交事务；不访问 wx。 */
import {
  clone,
  equal,
  toPath,
  pathKey,
  getValue,
  hasValue,
  putValue,
} from './value-path.js';
import { normalizeRules, matchesTrigger, runRule } from './rules.js';

export function createFormController(input = {}, options = {}) {
  let values = clone(input.model ?? input.initialValues ?? {});
  let baseline = clone(values);
  let config = { ...input };
  let validators = { ...options.validators };
  let messages = { ...options.messages };
  let uploads = { ...options.uploadAdapters };
  const records = new Map();
  const listeners = new Set();
  const resets = new Set();
  let revision = 0;
  let dead = false;
  let submitting = false;
  let attempt = false;
  let operation = 0;
  let previousMeta;
  const emit = (name, detail) => {
    if (!dead) {
      options.emit?.(name, clone(detail));
    }
  };
  const active = (record) =>
    record.config.active !== false &&
    !record.config.disabled &&
    !config.disabled;
  const rulesFor = (record) => {
    const root = Object.entries(config.rules ?? {}).find(
      ([name]) => pathKey(name) === record.key,
    )?.[1];
    return [
      ...normalizeRules(root),
      ...normalizeRules(record.config.itemRules),
      ...normalizeRules(record.config.rules),
    ];
  };
  function fieldState(record) {
    if (!record) {
      return undefined;
    }
    const errors = [];
    if (record.external != null) {
      errors.push({
        path: record.path,
        message: record.external,
        source: 'external',
      });
    }
    for (const [, result] of [...record.results].sort((a, b) => a[0] - b[0])) {
      if (result.error) {
        errors.push({ ...result.error, path: record.path, source: 'rule' });
      }
    }
    const checked = rulesFor(record).every(
      (_, index) => record.results.get(index)?.version === record.version,
    );
    let status = 'idle';
    if (record.running) {
      status = 'validating';
    } else if (errors.length) {
      status = 'invalid';
    } else if (checked) {
      status = 'valid';
    }
    return {
      path: record.path,
      value: getValue(values, record.path),
      dirty: !equal(getValue(values, record.path), record.baselineValue),
      touched: record.touched,
      status,
      errors,
      errorMessage: record.visible ? (errors[0]?.message ?? '') : '',
      pending: record.pending,
      required: rulesFor(record).some((rule) => rule.required || rule.accepted),
      disabled: !!(config.disabled || record.config.disabled),
      readonly: !!(config.readonly || record.config.readonly),
    };
  }
  function snapshot() {
    const fields = [...records.values()].filter(active).map(fieldState);
    const errors = fields.flatMap((field) => field.errors);
    const validating = fields.some((field) => field.status === 'validating');
    const valid =
      !errors.length && fields.every((field) => field.status === 'valid');
    const pending = fields.some((field) => field.pending);
    const busy = submitting || !!config.submitting;
    return clone({
      values,
      errors,
      valid,
      validating,
      pending,
      submitting: busy,
      dirty: !equal(values, baseline),
      touched: fields.some((field) => field.touched),
      status: validating
        ? 'validating'
        : errors.length
          ? 'invalid'
          : valid
            ? 'valid'
            : 'idle',
      canSubmit: !config.disabled && !pending && !busy && !attempt,
    });
  }
  function publish() {
    if (dead) {
      return;
    }
    const state = snapshot();
    for (const listener of [...listeners]) {
      listener(state);
    }
    const { values: ignoredValues, errors: ignoredErrors, ...meta } = state;
    if (!equal(previousMeta, meta)) {
      previousMeta = meta;
      emit('statechange', meta);
    }
  }
  function invalidate(record, clearExternal = false) {
    record.version++;
    record.cancel?.();
    record.cancel = null;
    record.running = false;
    if (clearExternal) {
      record.external = null;
    }
  }
  function replace(next, source, notify, preserved = new Set()) {
    if (dead || equal(values, next)) {
      return false;
    }
    const before = values;
    values = clone(next);
    revision++;
    const changed = [];
    for (const record of records.values()) {
      if (
        !equal(getValue(before, record.path), getValue(values, record.path))
      ) {
        invalidate(record, !preserved.has(record));
        changed.push(record);
      }
    }
    publish();
    if (notify) {
      emit('change', {
        changes: changed.map((record) => ({
          path: record.path,
          value: getValue(values, record.path),
        })),
        values,
        source,
      });
    }
    const scheduled = new Set(changed);
    for (const record of records.values()) {
      const dependencies = rulesFor(record).flatMap(
        (rule) => rule.dependencies ?? [],
      );
      if (
        dependencies.some(
          (name) => !equal(getValue(before, name), getValue(values, name)),
        )
      ) {
        invalidate(record);
        scheduled.add(record);
      }
    }
    for (const record of scheduled) {
      if (!changed.includes(record) && active(record)) {
        void validateField(record.path, { silent: !record.visible });
      }
    }
    return true;
  }
  function registerField(path, fieldConfig = {}) {
    if (dead) {
      throw new Error('Form is disposed');
    }
    const parts = toPath(path);
    const key = pathKey(parts);
    if (records.has(key)) {
      throw new Error(`Duplicate form field: ${parts.join('.')}`);
    }
    const record = {
      key,
      path: parts,
      config: fieldConfig,
      version: 0,
      results: new Map(),
      external: null,
      pending: false,
      touched: false,
      visible: false,
      running: false,
    };
    records.set(key, record);
    if (!hasValue(values, parts)) {
      putValue(values, parts, fieldConfig.defaultValue);
      putValue(baseline, parts, fieldConfig.defaultValue);
    }
    record.baselineValue = clone(getValue(baseline, parts));
    revision++;
    publish();
    return {
      get path() {
        return [...record.path];
      },
      update(next) {
        if (records.get(record.key) !== record) {
          return;
        }
        if (!equal(next, record.config)) {
          const changed =
            !equal(next.rules, record.config.rules) ||
            !equal(next.itemRules, record.config.itemRules);
          record.config = next;
          invalidate(record);
          if (changed) {
            record.results.clear();
          }
          revision++;
          publish();
        }
      },
      setPending(pending) {
        if (
          records.get(record.key) === record &&
          record.pending !== !!pending
        ) {
          record.pending = !!pending;
          publish();
        }
      },
      touch() {
        record.touched = true;
        publish();
      },
      unregister({ remove = record.config.preserve === false } = {}) {
        if (records.get(record.key) !== record) {
          return;
        }
        invalidate(record);
        records.delete(record.key);
        revision++;
        if (remove) {
          putValue(values, record.path, undefined, true);
          putValue(baseline, record.path, undefined, true);
          emit('change', { path: parts, values, source: 'unregister' });
        }
        publish();
      },
    };
  }
  async function validateField(path, { event = '', silent = false } = {}) {
    const record = records.get(pathKey(path));
    if (!record || !active(record) || dead) {
      return 'valid';
    }
    const rules = rulesFor(record);
    const chosen = rules
      .map((rule, index) => ({ rule, index }))
      .filter(
        ({ rule }) =>
          (event === 'input' && record.visible && rule.trigger === undefined) ||
          matchesTrigger(rule, event, record.config.validateOn ?? 'change'),
      );
    if (!chosen.length) {
      return fieldState(record).status;
    }
    record.cancel?.();
    const version = record.version;
    const token = {};
    record.token = token;
    const current = () =>
      !dead &&
      records.get(record.key) === record &&
      record.token === token &&
      record.version === version &&
      active(record);
    let cancelled;
    const cancellation = new Promise((resolve) => {
      cancelled = () => resolve('superseded');
    });
    record.cancel = cancelled;
    record.running = true;
    if (!silent) {
      record.visible = true;
    }
    publish();
    const snapshotValues = clone(values);
    const execute = async () => {
      for (const { rule, index } of chosen) {
        if (event && rule.debounce > 0) {
          await new Promise((resolve) => {
            const timer = setTimeout(resolve, rule.debounce);
            const previous = record.cancel;
            record.cancel = () => {
              clearTimeout(timer);
              resolve();
              previous();
            };
          });
        }
        if (!current()) {
          return 'superseded';
        }
        let error;
        try {
          error = await runRule(
            rule,
            getValue(snapshotValues, record.path),
            {
              path: [...record.path],
              label: record.config.label ?? '',
              values: clone(snapshotValues),
              isCurrent: current,
            },
            { validators, messages },
          );
        } catch (failure) {
          error = {
            message: failure.message || 'Validation failed',
            rule: 'validator',
          };
          if (current()) {
            emit('error', {
              type: 'validation',
              path: record.path,
              message: error.message,
            });
          }
        }
        if (!current()) {
          return 'superseded';
        }
        record.results.set(index, { version, error });
      }
      return fieldState(record).errors.length ? 'invalid' : 'valid';
    };
    const result = await Promise.race([execute(), cancellation]);
    if (current()) {
      record.running = false;
      record.cancel = null;
      publish();
    }
    return result;
  }
  async function validate({ paths, silent = false } = {}) {
    const start = revision;
    const selected = paths
      ? paths.map((path) => records.get(pathKey(path))).filter(Boolean)
      : [...records.values()];
    const results = await Promise.all(
      selected
        .filter(active)
        .map((record) => validateField(record.path, { silent })),
    );
    const state = snapshot();
    const selectedKeys = new Set(
      selected.filter(active).map((record) => record.key),
    );
    const errors = state.errors.filter((error) =>
      selectedKeys.has(pathKey(error.path)),
    );
    const status =
      dead || revision !== start || results.includes('superseded')
        ? 'superseded'
        : errors.length
          ? 'invalid'
          : 'valid';
    const result = { status, values: state.values, errors };
    emit('validate', result);
    return result;
  }
  async function submit(handler) {
    const state = snapshot();
    if (dead || !state.canSubmit) {
      return { status: 'blocked', reason: dead ? 'disposed' : 'busy' };
    }
    const op = ++operation;
    attempt = true;
    publish();
    try {
      const result = await validate();
      if (op !== operation || result.status === 'superseded') {
        return { ...result, status: 'superseded' };
      }
      if (result.status === 'invalid') {
        emit('invalid', { ...result, firstErrorPath: result.errors[0]?.path });
        return result;
      }
      if (snapshot().pending || config.disabled || config.submitting) {
        return { status: 'blocked', reason: 'busy' };
      }
      submitting = !!handler;
      publish();
      emit('submit', { values: result.values });
      if (handler) {
        await handler(clone(result.values));
      }
      return { ...result, status: 'submitted' };
    } catch (error) {
      emit('error', {
        type: 'submit',
        message: error.message || 'Submission failed',
      });
      throw error;
    } finally {
      if (op === operation) {
        submitting = false;
        attempt = false;
        publish();
      }
    }
  }
  const api = {
    registerField,
    validateField,
    validate,
    submit,
    handleSubmit: (handler) => () => submit(handler),
    getValues: () => clone(values),
    getState: snapshot,
    getFieldState: (path) => clone(fieldState(records.get(pathKey(path)))),
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshot());
      return () => listeners.delete(listener);
    },
    onReset(listener) {
      resets.add(listener);
      return () => resets.delete(listener);
    },
    setFieldValue(path, value, source = 'method') {
      const next = clone(values);
      putValue(next, path, value);
      return replace(next, source, true);
    },
    reorderArray(path, nextValues, indices) {
      const prefix = toPath(path);
      const affected = [...records.values()].filter(
        (record) =>
          prefix.every((part, index) => record.path[index] === part) &&
          typeof record.path[prefix.length] === 'number',
      );
      for (const record of affected) {
        records.delete(record.key);
        invalidate(record);
      }
      for (const record of affected) {
        const old = record.path[prefix.length];
        const index = indices.indexOf(old);
        if (index < 0) {
          continue;
        }
        record.path = [
          ...prefix,
          index,
          ...record.path.slice(prefix.length + 1),
        ];
        record.key = pathKey(record.path);
        records.set(record.key, record);
      }

      const next = clone(values);
      putValue(next, prefix, nextValues);
      replace(next, 'array', true, new Set(affected));
      revision++;
      publish();
    },
    setValues(next) {
      return replace({ ...values, ...clone(next) }, 'method', true);
    },
    syncModel(next) {
      if (next != null) {
        replace(next, 'model', false);
      }
    },
    setFieldError(path, message) {
      const record = records.get(pathKey(path));
      if (record) {
        record.external = message;
        record.visible = message != null;
        publish();
      }
    },
    hideErrors(paths) {
      const keys = paths?.map(pathKey);
      for (const record of records.values()) {
        if (!keys || keys.includes(record.key)) {
          record.visible = false;
        }
      }
      publish();
    },
    reset(next) {
      if (dead) {
        return;
      }
      operation++;
      attempt = false;
      submitting = false;
      revision++;
      if (next !== undefined) {
        baseline = clone(next);
      }
      values = clone(baseline);
      for (const record of records.values()) {
        invalidate(record, true);
        record.results.clear();
        record.touched = false;
        record.visible = false;
        record.pending = false;
        record.baselineValue = clone(getValue(baseline, record.path));
      }
      for (const listener of resets) {
        listener();
      }
      publish();
      emit('change', { values, source: 'reset' });
      emit('reset', { values });
    },
    configure(next) {
      const ruleChanged = !equal(config.rules, next.rules ?? config.rules);
      const stateChanged =
        config.disabled !== next.disabled || config.readonly !== next.readonly;
      config = { ...config, ...next };
      if (ruleChanged || stateChanged) {
        revision++;
        for (const record of records.values()) {
          invalidate(record);
          if (ruleChanged) {
            record.results.clear();
          }
        }
      }
      publish();
    },
    setValidators(next) {
      validators = { ...next };
      revision++;
      for (const record of records.values()) {
        invalidate(record);
        record.results.clear();
      }
      publish();
    },
    setMessages(next) {
      messages = { ...next };
      revision++;
      for (const record of records.values()) {
        invalidate(record);
        record.results.clear();
      }
      publish();
    },
    setUploadAdapters(next) {
      uploads = { ...next };
    },
    getUploadAdapter: (name) => uploads[name],
    dispose() {
      if (dead) {
        return;
      }
      dead = true;
      operation++;
      for (const record of records.values()) {
        invalidate(record);
      }
      records.clear();
      listeners.clear();
      for (const listener of resets) {
        listener();
      }
      resets.clear();
    },
  };
  return api;
}
