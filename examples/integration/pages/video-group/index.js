/** 页面通过 rmp group 协调三个独立的 rmp video 组件。 */
import { definePage } from '../../vendor/reactive-mp/src/index.js';
import { useVideoDemo } from '../../hooks/use-video-demo.js';
definePage(() => ({
  ...useVideoDemo(),
  players: [
    { id: 'first', name: '视频 A' },
    { id: 'second', name: '视频 B' },
    { id: 'third', name: '视频 C' },
  ],
}));
