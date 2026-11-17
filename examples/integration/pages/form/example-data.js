/** 两种页面接入共享的纯示例数据，不包含函数或请求逻辑。 */
export const formExample = {
  model: { name: '', email: '', topic: 0, accepted: false },
  rules: {
    name: [{ required: true, message: '请输入名称' }],
    email: [{ validator: 'email', message: '请输入含 @ 的邮箱' }],
    accepted: [{ accepted: true, message: '请先勾选' }],
  },
  options: [
    { label: '选项零', value: 0 },
    { label: '选项一', value: 1 },
  ],
};
