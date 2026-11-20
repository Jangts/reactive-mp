/** Calendar documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: '2026-11-18',
    },
    result: '',
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values) });
  },
});
