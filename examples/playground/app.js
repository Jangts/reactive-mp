/** 原生开发宿主的 app 场景，用于交互复现与核心包联调。 */
import { defineApp } from './vendor/reactive-mp/src/index.js';

defineApp(() => {
  const onLaunch = () => {
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    wx.login({
      success: (res) => {},
    });
  };
  return {
    userInfo: null,
    onLaunch,
  };
});
