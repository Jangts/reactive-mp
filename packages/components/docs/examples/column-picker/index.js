/** ColumnPicker documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: ['bj', 'morning'],
    },
    result: '',
    options: [
      [
        {
          label: 'Beijing',
          value: 'bj',
        },
        {
          label: 'Shanghai',
          value: 'sh',
        },
      ],
      [
        {
          label: 'Morning',
          value: 'morning',
        },
        {
          label: 'Evening',
          value: 'evening',
        },
      ],
    ],
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values) });
  },
});
