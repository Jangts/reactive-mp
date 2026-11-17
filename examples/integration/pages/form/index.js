/** 表单示例目录，分别展示组件消费、Hooks 和完整字段组合。 */
Page({
  open(event) {
    wx.navigateTo({
      url: '/pages/form-' + event.currentTarget.dataset.page + '/index',
    });
  },
});
