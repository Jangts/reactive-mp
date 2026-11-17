/** 普通 Page 消费微信封装，验证真实缓存、选择器、用户交互和请求。 */
import {
  getStorageItem,
  setStorageItem,
  wxSelect,
  wxLogin,
  wxChooseImage,
  wxShowToast,
  wxRequest,
  createRequest,
} from '../../vendor/kit/miniprogram/wechat/index.js';

/** 只把可展示的结果放入 data，避免将原生任务与错误对象送往视图。 */
function showResult(page, result) {
  if (!page._active) {
    return;
  }
  page.setData({
    result: result[0] ? JSON.stringify(result[1]) : result[1].message,
  });
}

Page({
  data: { result: '点击按钮验证微信原生封装', url: '' },
  onLoad() {
    this._active = true;
  },
  onUnload() {
    this._active = false;
    this._task?.abort();
  },
  async checkStorage() {
    const key = 'reactive-mp:wechat-demo';
    const results = [];
    try {
      for (const value of [0, false, '']) {
        const write = setStorageItem(key, value);
        const read = getStorageItem(key);
        results.push({ value, pass: write[0] && read[0] && read[1] === value });
      }
      showResult(this, [true, results]);
    } finally {
      wx.removeStorageSync(key);
    }
  },
  async checkRect() {
    showResult(this, await wxSelect('#probe', this).rect());
  },
  async login() {
    const [ok, code] = await wxLogin();
    showResult(this, [ok, ok ? '已获取登录 code' : code]);
  },
  async chooseImage() {
    const [ok, files] = await wxChooseImage({ count: 1 });
    showResult(this, [ok, ok ? { count: files.length } : files]);
  },
  async toast() {
    showResult(this, await wxShowToast('微信封装测试'));
  },
  changeUrl(event) {
    this.setData({ url: event.detail.value });
  },
  async request() {
    const client = createRequest('', {
      interceptors: {
        async onResponseResolve(response) {
          return { statusCode: response.statusCode, data: response.data };
        },
      },
    });
    showResult(this, await client.get(this.data.url));
  },
  async requestAndAbort() {
    const call = wxRequest(this.data.url);
    this._task = call.task;
    call.task?.abort();
    showResult(this, await call);
  },
});
