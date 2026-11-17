/** 轮播演示的响应式页面配置和有界事件列表。 */
import {
  useSignal,
  useCurrentInstance,
} from '../vendor/reactive-mp/src/index.js';
import { swiperDemoItems } from '../utils/swiper-demo.js';
export function useSwiperDemo() {
  const instance = useCurrentInstance();
  const [items, setItems] = useSignal(swiperDemoItems);
  const [current, setCurrent] = useSignal(1);
  const [layout, setLayout] = useSignal('focus');
  const [disabled, setDisabled] = useSignal(false);
  const [events, setEvents] = useSignal([]);
  function record(name, detail) {
    if (name === 'change') {
      setCurrent(detail.current);
    }
    setEvents([`${name}: ${JSON.stringify(detail)}`, ...events()].slice(0, 8));
  }
  return {
    items,
    current,
    layout,
    disabled,
    events,
    record,
    selectLayout: (event) => setLayout(event.currentTarget.dataset.layout),
    toggleTouch: () => setDisabled(!disabled()),
    toggleItems: () =>
      setItems(
        items().length === 3 ? swiperDemoItems.slice(0, 1) : swiperDemoItems,
      ),
    onSwiperEvent: (event) => record(event.type, event.detail),
    nextItem: () => instance.selectComponent('#gallery')?.next(),
    previousItem: () => instance.selectComponent('#gallery')?.previous(),
    muteAll: () => instance.selectComponent('#group')?.muteAll(),
  };
}
