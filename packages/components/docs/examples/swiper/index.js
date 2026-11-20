/** Swiper documentation demo: native Page event wiring. */
Page({
  data: {
    items: [
      {
        id: 'a',
        type: 'image',
        src: '/assets/first.jpg',
      },
      {
        id: 'b',
        type: 'image',
        src: '/assets/second.jpg',
        poster: '/assets/second.jpg',
      },
    ],
    current: 0,
  },
  onChange(event) {
    this.setData({ current: event.detail.current });
  },
  next() {
    this.selectComponent('#gallery').next();
  },
});
