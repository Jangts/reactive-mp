/** MediaSwiper documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [current, setCurrent] = useSignal(0);
  const page = useCurrentInstance();

  return {
    items: [
      {
        id: 'a',
        type: 'image',
        src: '/assets/first.jpg',
      },
      {
        id: 'b',
        type: 'video',
        src: '/assets/demo.mp4',
        poster: '/assets/second.jpg',
      },
    ],
    current,
    onChange: (event) => setCurrent(event.detail.current),
    next: () => page.selectComponent('#gallery').next(),
  };
});
