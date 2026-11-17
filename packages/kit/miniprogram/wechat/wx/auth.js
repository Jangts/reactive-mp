/** 微信登录、scope 授权与订阅状态；交互提示由应用负责。 */
import { callWechat, WechatError } from '../result.js';

/** 获取一次性登录 code，不交换业务 token，也不持久化身份。 */
export function wxLogin(options = {}) {
  return callWechat('login', options, (response) => {
    if (!response.code) {
      throw new WechatError('wx.login returned no code', {
        api: 'login',
        code: 'LOGIN_NO_CODE',
        cause: response,
      });
    }
    return response.code;
  });
}

/** 已获授权时直接成功；否则请求指定 scope，失败不自动弹窗。 */
export async function wxAuthorize(scope) {
  const [ok, setting] = await callWechat('getSetting');
  if (!ok) {
    return [false, setting];
  }
  if (setting.authSetting?.[scope]) {
    return [true, ''];
  }
  return callWechat('authorize', { scope }, () => '');
}

/** 查询订阅设置；mainSwitch 为 false 仍是成功查询，不代表授权成功。 */
export function wxCheckSubscriptionsSetting() {
  return callWechat(
    'getSetting',
    { withSubscriptions: true },
    (response) => response.subscriptionsSetting ?? {},
  );
}

/** 在用户操作回调内直接调用，不以异步预检打断原生交互时序。 */
export function requestSubscriptionsNotification(tmplId) {
  return callWechat('requestSubscribeMessage', { tmplIds: [tmplId] }, (res) => {
    if (res[tmplId] !== 'accept') {
      throw new WechatError(`Subscription was not accepted: ${res[tmplId]}`, {
        api: 'requestSubscribeMessage',
        code: 'SUBSCRIPTION_NOT_ACCEPTED',
        cause: res,
      });
    }
    return res;
  });
}
