/** 媒体轮播作为一个声音分组成员，跨越原生 swiper 内容边界协调内部视频。 */
import { computed, useSignal, watch } from '@reactive-mp/reactivity';
import { useCurrentInstance, onReady, onUnmounted } from '@reactive-mp/runtime';
import { useVideoParticipant } from '@reactive-mp/video';
import { itemEntries } from '../utils/layouts.js';
export function useMediaSwiper(props, options = {}) {
  const instance = useCurrentInstance();
  let disposed = false;
  onUnmounted(() => {
    disposed = true;
  });
  const [sounds, setSounds] = useSignal({});
  const [ready, setReady] = useSignal(false);
  let requests = new Map();
  const entries = computed(() =>
    itemEntries(
      Array.isArray(props.items) ? props.items : [],
      props.itemKey || 'id',
    ),
  );
  const mute = () => {
    if (!disposed) {
      setSounds(
        Object.fromEntries(entries().map((entry) => [entry.key, true])),
      );
    }
  };
  const participant = useVideoParticipant(mute);
  const activateSound = (key) => {
    setSounds(
      Object.fromEntries(
        entries().map((entry) => [entry.key, entry.key !== key]),
      ),
    );
    if (ready()) {
      participant.activateSound();
    }
  };
  watch(
    entries,
    (values) => {
      const next = {};
      let selected;
      for (const entry of values) {
        const muted = entry.value.muted ?? true;
        const previous = requests.get(entry.key);
        const changed =
          !previous ||
          previous.muted !== muted ||
          previous.type !== entry.value.type;
        next[entry.key] = changed ? muted : (sounds()[entry.key] ?? muted);
        if (changed && !muted && entry.value.type === 'video') {
          selected = entry.key;
        }
      }
      requests = new Map(
        values.map((entry) => [
          entry.key,
          { muted: entry.value.muted ?? true, type: entry.value.type },
        ]),
      );
      if (selected !== undefined) {
        activateSound(selected);
      } else {
        setSounds(next);
      }
    },
    { immediate: true },
  );
  onReady(() => {
    if (
      entries().some(
        (entry) =>
          entry.value.type === 'video' && sounds()[entry.key] === false,
      )
    ) {
      participant.activateSound();
    }
    setReady(true);
  });
  const emit = (name, detail) => {
    if (disposed) {
      return;
    }
    if (options.emit) {
      options.emit(name, detail);
    } else {
      instance?.triggerEvent(name, detail);
    }
  };
  const swiper = () =>
    disposed
      ? undefined
      : instance.selectComponent(options.selector || '#swiper');
  return {
    mediaItems: computed(() =>
      entries().map((entry) => ({
        ...entry.value,
        muted: !ready() || (sounds()[entry.key] ?? entry.value.muted ?? true),
      })),
    ),
    mute,
    to: (index) => swiper()?.to(index),
    next: () => swiper()?.next(),
    previous: () => swiper()?.previous(),
    refresh: () => swiper()?.refresh(),
    onChange: (event) => emit('change', event.detail),
    onAnimationFinish: (event) => emit('animationfinish', event.detail),
    onTransitionStart: (event) => emit('transitionstart', event.detail),
    onItemClick(event) {
      if (disposed) {
        return;
      }
      emit('itemclick', {
        ...event.detail,
        item: (props.items || [])[event.detail.index],
      });
    },
    onMediaEvent(event) {
      if (disposed) {
        return;
      }
      const { index, detail } = event.detail;
      const entry = entries()[index];
      if (!Number.isInteger(index) || !entry) {
        return;
      }
      if (detail?.type === 'soundon') {
        activateSound(entry.key);
      } else if (
        detail?.type === 'mutedchange' &&
        typeof detail.detail?.muted === 'boolean'
      ) {
        if (detail.detail.muted) {
          setSounds({ ...sounds(), [entry.key]: true });
        } else {
          activateSound(entry.key);
        }
      }
      emit('itemevent', { index, item: (props.items || [])[index], detail });
    },
  };
}
