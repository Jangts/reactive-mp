/** 原生开发宿主的 logs 场景，用于交互复现与核心包联调。 */

const util = require('../../utils/util.js');

Page({
  data: {
    logs: [],
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log) => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log,
        };
      }),
    });
  },
});
