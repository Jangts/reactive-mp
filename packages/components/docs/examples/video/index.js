/** Video documentation demo: native Page event wiring. */
Page({
  data: {
    src: '/assets/demo.mp4',
  },
  play() {
    this.selectComponent('#video').play();
  },
});
