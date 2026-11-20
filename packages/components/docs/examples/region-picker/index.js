/** RegionPicker documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: ['北京市', '北京市', '东城区'],
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
