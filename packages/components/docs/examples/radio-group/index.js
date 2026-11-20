/** RadioGroup documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: 0,
    },
    result: '',
    options: [
      {
        label: 'Beijing',
        value: 0,
      },
      {
        label: 'Shanghai',
        value: 1,
      },
      {
        label: 'Guangzhou',
        value: 2,
      },
    ],
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values) });
  },
});
