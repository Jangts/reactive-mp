/** Switch documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: false,
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
