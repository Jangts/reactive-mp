/** 轮播演示的数据只使用生成的动效封面和抽象卡片。 */
export const swiperDemoItems = [
  {
    id: 'a',
    title: '卡片 A',
    src: '/assets/video/orbit.jpg',
    color: '#d9e9ff',
  },
  {
    id: 'b',
    title: '卡片 B',
    src: '/assets/video/bounce.jpg',
    color: '#e5ddfa',
  },
  {
    id: 'c',
    title: '卡片 C',
    src: '/assets/video/wave.jpg',
    color: '#d7eee6',
  },
];
export function createSwiperDemoMedia(clip) {
  return [
    { id: 'image', type: 'image', src: clip.poster },
    { id: clip.id, type: 'video', src: clip.src, poster: clip.poster },
  ];
}
