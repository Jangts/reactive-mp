/** Reactive Page 使用 rmp video 组件，不直接管理原生播放器。 */
import { definePage } from '../../vendor/reactive-mp/src/index.js';
import { useVideoDemo } from '../../hooks/use-video-demo.js';
definePage(() => useVideoDemo());
