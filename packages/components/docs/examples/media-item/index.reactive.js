/** MediaItem documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';

definePage(() => {
  return {
    item: {
      type: 'image',
      src: '/assets/first.jpg',
      mode: 'aspectFill',
    },
  };
});
