/** VideoGroup documentation demo: reactive composition page. */
import {
  definePage,
  useCurrentInstance,
} from '../../vendor/runtime/src/index.js';

definePage(() => {
  const page = useCurrentInstance();

  return {
    first: '/assets/first.mp4',
    second: '/assets/second.mp4',
    muteAll: () => page.selectComponent('#group').muteAll(),
  };
});
