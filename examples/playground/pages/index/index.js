/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */

import {
  useSignal,
  watchEffect,
  computed,
  definePage,
  useSchedule,
  onReady,
} from '../../vendor/reactive-mp/src/index.js';
import { useCounter, useWatches } from './hooks.js';

const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

const [globalCount, updareGlobalCount] = useSignal(0);

definePage(({ provide, $this }) => {
  useWatches();
  const count = useCounter();
  const motto = computed(() => `Hello World ${count()}`);

  provide('page', $this?.is);
  provide('motto', motto);

  watchEffect(() => {});

  useSchedule(
    () => {
      updareGlobalCount(globalCount() + 1);
    },
    {
      interval: 2000,
      times: 8,
    },
  );

  onReady(function () {
    console.log('onReady', this);
  });

  return {
    motto,
    globalCount,
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    onPageScroll(e) {
      console.log('page onPageScroll', e);
    },
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      });
    },
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      const { nickName } = this.data.userInfo;
      this.setData({
        'userInfo.avatarUrl': avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      });
    },
    onInputChange(e) {
      const nickName = e.detail.value;
      const { avatarUrl } = this.data.userInfo;
      this.setData({
        'userInfo.nickName': nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      });
    },
    getUserProfile(e) {
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res);
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
          });
        },
      });
    },
    onShareAppMessage() {
      console.log('page.onShareAppMessage');
      return {
        title: '转发标题A',
        imageUrl: '', // 图片 URL
      };
    },
  };
});
