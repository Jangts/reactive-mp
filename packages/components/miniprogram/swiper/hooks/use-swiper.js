/** 轮播索引、数据变化和事件的响应式组合接口；不读取内容业务字段。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useCurrentInstance, onReady, onUnmounted } from '@reactive-mp/runtime';
import { swiperProperties } from '../utils/properties.js';
import {
  normalizeIndex,
  resolveLayout,
  itemEntries,
} from '../utils/layouts.js';
export function useSwiper(input = {}, options = {}) {
  const instance = useCurrentInstance();
  const props = {};
  for (const [key, schema] of Object.entries(swiperProperties)) {
    Object.defineProperty(props, key, {
      get: () => input[key] ?? schema.value,
    });
  }
  const items = computed(() => (Array.isArray(props.items) ? props.items : []));
  const count = computed(() => items().length);
  const normalize = (index) => normalizeIndex(index, count(), props.circular);
  const [current, setCurrent] = useSignal(normalize(props.current));
  const [applied, setApplied] = useSignal(current());
  const [transitioning, setTransitioning] = useSignal(false);
  const [revision, setRevision] = useSignal(0);
  let initialized = count() > 0;
  const refresh = () => {
    if (!disposed) {
      setRevision(revision() + 1);
    }
  };
  let disposed = false;
  const emit = (name, detail) => {
    if (disposed) {
      return;
    }
    if (options.emit) {
      options.emit(name, detail);
    } else {
      instance?.triggerEvent?.(name, detail);
    }
  };
  function applyCurrent(index, source) {
    if (disposed) {
      return;
    }
    const next = normalize(index);
    if (next !== current()) {
      setCurrent(next);
      emit('change', { current: next, source });
    }
  }
  watch(
    () => props.current,
    (index) => applyCurrent(index, 'property'),
  );
  watch([items, () => props.circular], () => {
    const next = normalize(initialized ? current() : props.current);
    applyCurrent(next, 'items');
    setApplied(initialized ? normalize(applied()) : next);
    initialized ||= count() > 0;
    setTransitioning(false);
    refresh();
  });
  onReady(refresh);
  onUnmounted(() => {
    disposed = true;
  });
  return {
    current,
    applied,
    transitioning,
    count,
    refresh,
    entries: computed(() => itemEntries(items(), props.itemKey)),
    renderOptions: computed(() => ({
      ...resolveLayout(props.layout),
      revision: revision(),
      count: count(),
      current: applied(),
      circular: props.circular,
      duration: Math.max(0, props.duration),
    })),
    previousMargin: computed(
      () => props.peek || resolveLayout(props.layout).peek,
    ),
    nextMargin: computed(() => props.peek || resolveLayout(props.layout).peek),
    to: (index) => applyCurrent(index, 'method'),
    next: () => applyCurrent(current() + 1, 'method'),
    previous: () => applyCurrent(current() - 1, 'method'),
    onChange(event) {
      applyCurrent(event.detail.current, event.detail.source || 'native');
    },
    onTransitionStart(event) {
      if (disposed) {
        return;
      }
      setTransitioning(true);
      emit('transitionstart', event.detail);
    },
    onTransition(event) {
      if (disposed) {
        return;
      }
      setTransitioning(true);
      emit('transition', event.detail);
    },
    onAnimationFinish(event) {
      if (disposed) {
        return;
      }
      const next = normalize(event.detail.current);
      applyCurrent(next, event.detail.source || 'native');
      setApplied(next);
      setTransitioning(false);
      emit('animationfinish', { ...event.detail, current: next });
    },
    onItemClick(event) {
      if (disposed || transitioning()) {
        return;
      }
      const index = Number(
        event.detail?.index ?? event.currentTarget?.dataset?.index,
      );
      if (!Number.isInteger(index) || index < 0 || index >= count()) {
        return;
      }
      emit('itemclick', {
        index,
        item: items()[index],
        active: index === current(),
      });
    },
    onItemEvent(event) {
      const index = Number(event.currentTarget.dataset.index);
      emit('itemevent', { index, item: items()[index], detail: event.detail });
    },
  };
}
