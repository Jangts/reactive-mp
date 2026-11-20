/** VideoGroup documentation demo: native Page event wiring. */
Page({
  data: {
    first: '/assets/first.mp4',
    second: '/assets/second.mp4',
  },
  muteAll() {
    this.selectComponent('#group').muteAll();
  },
});
