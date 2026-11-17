/** 单个逻辑字段的注册、继承、原生事件与生命周期；独立字段复用同一控制器。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useCurrentInstance, onUnmounted } from '@reactive-mp/runtime';
import { createFormController } from '../utils/form-controller.js';
import { useFormRelations } from '../utils/relations.js';
import { normalizeRules } from '../utils/rules.js';
import { pathKey, equal } from '../utils/value-path.js';
export function useField(props = {}, options = {}) {
  const instance = useCurrentInstance();
  let disposed = false;
  const emit = (name, detail = {}) => {
    if (instance && !disposed) {
      (options.emit ?? instance.triggerEvent.bind(instance))(name, detail);
    }
  };
  const local = createFormController(
    {},
    {
      validators: options.validators,
      messages: options.messages,
      emit: (name, detail) => {
        if (name === 'error') {
          emit(name, detail);
        }
      },
    },
  );
  const links = options.scope ? useFormRelations('field', {}) : null;
  const [state, setState] = useSignal({
    value: props.value ?? props.defaultValue ?? null,
    errorMessage: '',
    errors: [],
    status: 'idle',
    pending: false,
    dirty: false,
    touched: false,
    required: false,
    disabled: false,
    readonly: false,
  });
  let controller = local;
  let path = ['value'];
  let lease;
  let stop = () => {};
  let identity;
  let connected = false;
  function connect() {
    const root = options.form ?? links?.form()?.controller;
    const item = links?.item();
    const ownerItem = item && (!root || item.controller === root) ? item : null;
    const name = props.name || ownerItem?.props.name;
    const nextController =
      name && root
        ? root
        : name && ownerItem?.controller
          ? ownerItem.controller
          : local;
    const nextPath = nextController === local ? ['value'] : name;
    if (
      ownerItem?.props.name &&
      props.name &&
      pathKey(props.name) !== pathKey(ownerItem.props.name)
    ) {
      throw new Error('Field name must match its FormItem');
    }
    const fieldConfig = {
      label: props.label || ownerItem?.props.label || '',
      rules: [
        ...normalizeRules(props.rules),
        ...(props.required ? [{ required: true }] : []),
      ],
      itemRules: [
        ...normalizeRules(ownerItem?.props.rules),
        ...(ownerItem?.props.required ? [{ required: true }] : []),
      ],
      defaultValue:
        props.defaultValue ??
        (nextController === local ? props.value : undefined),
      disabled: !!(props.disabled || ownerItem?.props.disabled),
      readonly: !!(props.readonly || ownerItem?.props.readonly),
      active: props.active !== false && ownerItem?.props.active !== false,
      preserve: props.preserve !== false,
      validateOn: props.validateOn || options.validateOn || 'change',
    };
    const key = pathKey(nextPath);
    if (controller === nextController && lease && pathKey(lease.path) === key) {
      path = nextPath;
      identity = key;
    }
    if (controller !== nextController || identity !== key || !lease) {
      stop();
      lease?.unregister();
      controller = nextController;
      path = nextPath;
      identity = key;
      lease = controller.registerField(path, fieldConfig);
      stop = controller.subscribe(() => {
        const next = controller.getFieldState(lease?.path ?? path);
        if (!next) {
          return;
        }
        if (equal(next.value, state().value)) {
          next.value = state().value;
        }
        if (!equal(next, state())) {
          setState(next);
        }
      });
    } else {
      lease.update(fieldConfig);
    }
    connected = nextController !== local;
  }
  watch(
    () => {
      links?.form();
      links?.item();
      const item = links?.item();
      item?.controller;
      return [
        props.name,
        props.rules,
        props.required,
        props.disabled,
        props.readonly,
        props.active,
        props.preserve,
        props.label,
        props.validateOn,
        item?.props.name,
        item?.props.rules,
        item?.props.required,
        item?.props.disabled,
        item?.props.readonly,
        item?.props.active,
      ];
    },
    connect,
    { immediate: true },
  );
  watch(
    () => props.value,
    (value) => {
      if (!connected && value !== undefined && value !== null) {
        controller.setFieldValue(path, value, 'property');
      }
    },
  );
  const commit = (value, source = 'change', detail = {}) => {
    if (disposed || state().disabled || state().readonly) {
      return false;
    }
    const previousValue = state().value;
    const next = options.parse ? options.parse(value) : value;
    if (equal(previousValue, next)) {
      return false;
    }
    controller.setFieldValue(lease?.path ?? path, next, source);
    emit('change', { ...detail, path, value: next, previousValue, source });
    const event = source === 'input' && state().errorMessage ? 'input' : source;
    void controller.validateField(lease?.path ?? path, { event });
    return true;
  };
  function input(event) {
    let value = event.detail.value;
    if (typeof value === 'string' && props.maxlength >= 0) {
      value = Array.from(value).slice(0, props.maxlength).join('');
    }
    commit(value, 'input');
    emit('input', { ...event.detail, value, path });
    return value;
  }
  onUnmounted(() => {
    disposed = true;
    stop();
    lease?.unregister();
    local.dispose();
  });
  const bindings = Object.fromEntries(
    Object.keys(state())
      .filter((key) => key !== 'path')
      .map((key) => [
        key === 'value'
          ? 'fieldValue'
          : key === 'disabled'
            ? 'fieldDisabled'
            : key === 'readonly'
              ? 'fieldReadonly'
              : key,
        computed(() => state()[key]),
      ]),
  );
  return {
    ...bindings,
    value: computed(() =>
      options.format ? options.format(state().value) : state().value,
    ),
    get form() {
      state();
      return controller;
    },
    get path() {
      return lease?.path ?? path;
    },
    commit,
    emit,
    setPending: (pending) => lease?.setPending(pending),
    setValidators: (value) => controller.setValidators(value),
    setMessages: (value) => controller.setMessages(value),
    onInput: input,
    onChange: (event) => commit(event.detail.value, 'change'),
    onFocus: (event) => emit('focus', { ...event.detail, path }),
    onBlur(event) {
      lease.touch();
      emit('blur', { ...event.detail, path });
      void controller.validateField(lease?.path ?? path, { event: 'blur' });
    },
    onConfirm: (event) => emit('confirm', { ...event.detail, path }),
  };
}
