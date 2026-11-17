/** 页面通过 rmp group 协调三个独立的 rmp video 组件。 */
import { definePage } from '../../vendor/reactive-mp/src/index.js';
import { useVideoDemo } from '../../hooks/use-video-demo.js';
definePage(() => useVideoDemo());
