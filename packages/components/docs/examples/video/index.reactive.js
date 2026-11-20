/** Video documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';

definePage(() => {
  const page = useCurrentInstance();

  return {
    src: '/assets/demo.mp4',
    play: () => page.selectComponent('#video').play(),
  };
});
