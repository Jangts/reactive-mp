/** Cascader documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: [],
    },
    result: '',
    options: [
      {
        label: 'Clothing',
        value: 'clothing',
        children: [
          {
            label: 'Shirts',
            value: 'shirts',
            children: [],
          },
        ],
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
