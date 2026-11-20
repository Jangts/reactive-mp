/** CheckboxGroup documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: [],
    },
    result: '',
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
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
