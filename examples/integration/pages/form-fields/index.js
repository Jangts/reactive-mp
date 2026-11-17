/** 字段版式、异步选项接入、文件选择及多表单隔离示例。 */
Page({
  data: {
    result: '',
    options: [
      { label: '零', value: 0 },
      { label: '一', value: 1 },
      { label: '二', value: 2 },
      { label: '三', value: 3 },
    ],
    columns: [
      [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
      [
        { label: 'X', value: 'x' },
        { label: 'Y', value: 'y' },
      ],
    ],
    tree: [
      {
        label: '一级 A',
        value: 'a',
        children: [{ label: '二级 A', value: 'aa', children: [] }],
      },
      { label: '一级 B', value: 'b', children: [] },
    ],
    accept: ['image', 'video'],
    rules: { text: [{ required: true }], files: [{ required: true }] },
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values, null, 2) });
  },
  onPreview(event) {
    const file = event.detail.file;
    if (file.type === 'image') {
      wx.previewImage({ urls: [file.url || file.tempFilePath] });
    } else {
      wx.previewMedia({
        sources: [{ url: file.url || file.tempFilePath, type: 'video' }],
      });
    }
  },
});
