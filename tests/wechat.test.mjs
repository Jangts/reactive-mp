import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  WechatError, NetworkError, wxLogin, wxAuthorize,
  wxCheckSubscriptionsSetting, requestSubscriptionsNotification,
  wxRequest, wxChooseImage, wxUploadFile, wxGetImageInfo,
  wxShowToast, wxToastErrorMessage, getStorageItem, setStorageItem,
  wxSelect, wxSelectAll, wxSelectEvt, createRouter, formatRoute,
  wxNavigateTo, wxSwitchTab, createRequest, reusableGetter,
  debouncedGetter, debouncedSetter, isNetReqErr, isNetResErr,
  showResponseErrMsg,
} from '@reactive-mp/kit/wechat';

afterEach(() => { delete globalThis.wx; });
const success = (data = 'payload') => ({statusCode: 200, data, header: {}, errMsg: 'request:ok'});
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((a, b) => { resolve = a; reject = b; });
  return {promise, resolve, reject};
};

test('imports and subpaths need no wx and missing host returns a failure', async () => {
  delete globalThis.wx;
  const native = await import('@reactive-mp/kit/wechat/wx');
  const network = await import('@reactive-mp/kit/wechat/network');
  assert.equal(native.wxRequest, wxRequest);
  assert.equal(network.createRequest, createRequest);
  const [ok, error] = await wxLogin();
  assert.equal(ok, false);
  assert.equal(error.code, 'HOST_UNAVAILABLE');
});

test('login, authorization and subscription paths settle without built-in modal interactions', async () => {
  let authorized = 0, called = false;
  globalThis.wx = {
    login: ({success}) => success({code: 'wx-code'}),
    getSetting: ({success}) => success({authSetting: {'scope.record': true}, subscriptionsSetting: {mainSwitch: false}}),
    authorize: ({success}) => { authorized++; success({}); },
    requestSubscribeMessage: ({tmplIds, success}) => { called = true; success({[tmplIds[0]]: 'accept'}); },
  };
  assert.deepEqual(await wxLogin(), [true, 'wx-code']);
  assert.deepEqual(await wxAuthorize('scope.record'), [true, '']);
  assert.equal(authorized, 0);
  assert.deepEqual(await wxAuthorize('scope.userLocation'), [true, '']);
  assert.equal(authorized, 1);
  assert.deepEqual(await wxCheckSubscriptionsSetting(), [true, {mainSwitch: false}]);
  const subscription = requestSubscriptionsNotification('template');
  assert.equal(called, true, 'subscription native call starts synchronously');
  assert.equal((await subscription)[0], true);
  for (const status of ['reject', 'ban', 'cancel', 'unknown']) {
    wx.requestSubscribeMessage = ({success}) => success({template: status});
    assert.equal((await requestSubscriptionsNotification('template'))[1].code, 'SUBSCRIPTION_NOT_ACCEPTED');
  }
  wx.getSetting = ({fail}) => fail({errMsg: 'permission unavailable'});
  assert.equal((await wxAuthorize('scope.record'))[0], false);
  assert.equal((await wxCheckSubscriptionsSetting())[0], false);
  wx.login = ({success}) => success({});
  assert.equal((await wxLogin())[1].code, 'LOGIN_NO_CODE');
});

test('native request preserves options, response metadata, task and synchronous failures', async () => {
  const task = {abort() {}}, response = success(false);
  globalThis.wx = {request(options) {
    assert.equal(options.sslVerify, false);
    assert.equal(options.data, false);
    assert.equal(options.timeout, 0);
    options.success(response);
    return task;
  }};
  const call = wxRequest('https://example.test', {data: false, timeout: 0, sslVerify: false});
  assert.equal(call.task, task);
  assert.deepEqual(await call, [true, response]);
  wx.request = ({success}) => success({...response, statusCode: 404});
  const failed = await wxRequest('url');
  assert.equal(failed[0], false);
  assert.equal(failed[1].statusCode, 404);
  assert.equal((await wxRequest('url', {validateStatus: s => s === 404}))[0], true);
  wx.request = () => { throw new Error('native throw'); };
  assert.equal((await wxRequest('url'))[1].message, 'native throw');
  let abort;
  wx.request = ({fail}) => ({abort() { fail({errMsg: 'request:fail abort'}); }});
  const cancelled = wxRequest('url');
  abort = cancelled.task.abort;
  abort();
  assert.equal((await cancelled)[0], false);
});

test('storage distinguishes missing keys from all stored falsy values and reports write failures', () => {
  const values = new Map();
  globalThis.wx = {
    getStorageInfoSync: () => ({keys: [...values.keys()]}),
    getStorageSync: key => values.get(key),
    setStorageSync: (key, value) => values.set(key, value),
  };
  for (const value of [0, false, '', null]) {
    assert.deepEqual(setStorageItem('key', value), [true, value]);
    assert.deepEqual(getStorageItem('key'), [true, value]);
  }
  assert.equal(getStorageItem('absent')[1].code, 'STORAGE_NOT_FOUND');
  wx.setStorageSync = () => { throw new Error('quota exceeded'); };
  assert.equal(setStorageItem('key', 1)[1].message, 'quota exceeded');
  wx.getStorageInfoSync = () => { throw new Error('storage unavailable'); };
  assert.equal(getStorageItem('key')[0], false);
});

test('selectors respect context, handle all nodes and preserve missing-node failures', async () => {
  const context = {selectComponent: () => ({id: 'component'})};
  const rect = {width: 10, dataset: {id: 0}};
  const contexts = [];
  let result = rect;
  globalThis.wx = {createSelectorQuery() {
    const node = {boundingClientRect(callback) { return {exec() { callback(result); }}; }};
    return {in(value) { contexts.push(value); return this; }, select() {return node;}, selectAll() {return node;}};
  }};
  assert.deepEqual(wxSelect('#item', context).component(), {id: 'component'});
  assert.deepEqual(await wxSelect('#item', context).data('id'), [true, 0]);
  result = [];
  assert.deepEqual(await wxSelectAll('.item', context).rects(), [true, []]);
  assert.deepEqual(contexts, [context, context]);
  result = null;
  assert.equal((await wxSelect('#missing').data())[1].code, 'NODE_NOT_FOUND');
  const event = wxSelectEvt({detail: {value: false}, currentTarget: {dataset: {id: 0}}});
  assert.deepEqual(event.detail(), {value: false});
  assert.equal(event.detail('value'), false);
  assert.equal(event.data('id'), 0);
});

test('router uses explicit isolated tabs, encodes queries and keeps eventChannel', async () => {
  const calls = [], channel = {emit() {}};
  globalThis.wx = Object.fromEntries(['navigateTo', 'redirectTo', 'switchTab', 'reLaunch', 'navigateBack'].map(name => [name, options => {
    calls.push([name, options]); options.success({errMsg: 'ok', eventChannel: channel});
  }]));
  const tabs = ['pages/home'];
  const router = createRouter({tabRoutes: tabs});
  tabs.push('pages/other');
  assert.equal((await router.navigateTo('/pages/home'))[1].eventChannel, channel);
  assert.equal(calls.at(-1)[0], 'switchTab');
  await router.redirectTo('/pages/home');
  assert.equal(calls.at(-1)[0], 'switchTab');
  await wxNavigateTo('/pages/home');
  assert.equal(calls.at(-1)[0], 'navigateTo');
  assert.equal((await router.navigateTo({path: '/pages/home', query: {x: 1}}))[0], false);
  assert.equal((await wxSwitchTab('/pages/home?x=1'))[0], false);
  assert.equal((await wxSwitchTab('/pages/home?'))[0], false);
  const events = {done() {}};
  await router.navigateTo({path: 'pages/other?first=1', query: {q: 'a b', x: [0, false], nil: null, absent: undefined}}, events);
  assert.equal(calls.at(-1)[1].url, '/pages/other?first=1&q=a%20b&x=0&x=false&nil=');
  assert.equal(calls.at(-1)[1].events, events);
  await router.reLaunch('/pages/home');
  assert.equal(calls.at(-1)[0], 'reLaunch');
  await router.navigateBack();
  assert.equal(calls.at(-1)[1].delta, 1);
  assert.equal(formatRoute('/pages/home', ['pages/home']).isTabRoute, true);
  assert.equal((await router.navigateTo(''))[0], false);
  assert.throws(() => formatRoute('https://example.test'), TypeError);
  assert.equal(formatRoute({path: '/page?', query: {x: 1}}).url, '/page?x=1');
  assert.equal(formatRoute('/page?time=12:30?q=1').query, 'time=12:30?q=1');
});

test('file and toast wrappers have no business protocol and retain native failures', async () => {
  const response = {statusCode: 200, data: '{"url":"/file"}', errMsg: 'ok'};
  const task = {abort() {}, onProgressUpdate() {}};
  globalThis.wx = {
    chooseImage: ({success}) => success({tempFiles: [{path: 'tmp', size: 10}]}),
    getImageInfo: ({src, success}) => success({width: 1, height: 2, path: src}),
    uploadFile(options) {assert.equal(options.url, 'https://upload.test'); assert.deepEqual(options.header, {Authorization: 'Bearer example'}); options.success(response); return task;},
    showToast(options) {assert.equal(options.icon, 'none'); assert.equal(options.duration, 0); options.success({errMsg: 'ok'});},
  };
  assert.deepEqual(await wxChooseImage(), [true, [{path: 'tmp', size: 10}]]);
  assert.equal((await wxGetImageInfo('tmp'))[1].path, 'tmp');
  const options = {url: 'https://upload.test', filePath: 'tmp', name: 'file', header: {Authorization: 'Bearer example'}};
  const upload = wxUploadFile({...options, parseResponse: res => JSON.parse(res.data).url});
  assert.equal(upload.task, task);
  assert.deepEqual(await upload, [true, '/file']);
  assert.deepEqual(await wxUploadFile({...options, parseResponse: async () => '/async'}), [true, '/async']);
  assert.equal((await wxUploadFile({...options, async parseResponse() {throw new Error('async parse failed');}}))[1].message, 'async parse failed');
  assert.equal((await wxUploadFile({...options, parseResponse() {throw new Error('invalid data');}}))[0], false);
  wx.uploadFile = ({success}) => success({...response, statusCode: 500});
  assert.equal((await wxUploadFile(options))[1].statusCode, 500);
  assert.equal((await wxShowToast({title: 'ok', duration: 0}))[0], true);
  assert.equal((await wxShowToast(''))[0], false);
  wx.showToast = ({title, success}) => {assert.equal(title, 'failure'); success({errMsg: 'ok'});};
  await wxToastErrorMessage(new Error('failure'));
});

test('request client normalizes all entry points and awaits async interceptors', async () => {
  const sent = [];
  globalThis.wx = {request(options) {sent.push(options); options.success(success(0));}};
  const request = createRequest('https://api.test/base/', {
    headers: {'Content-Type': 'one'},
    interceptors: {
      async onRequest(config) {return {...config, url: config.url + '&hook=1', headers: {...config.headers, authorization: 'Bearer example'}};},
      async onResponseResolve(response) {return response.data;},
    },
  });
  assert.deepEqual(await request('/entry', {params: {x: 1}, headers: {'content-type': 'two'}, data: false, timeout: 0, sslVerify: false}), [true, 0]);
  assert.equal(sent[0].url, 'https://api.test/base/entry?x=1&hook=1');
  assert.deepEqual(sent[0].header, {'content-type': 'two', authorization: 'Bearer example'});
  assert.equal(sent[0].data, false);
  assert.equal(sent[0].sslVerify, false);
  assert.equal(sent[0].timeout, 0);
  for (const method of ['get', 'delete']) {
    await request[method]('/item', {x: 1});
    assert.equal(sent.at(-1).method, method.toUpperCase());
    await request[method]('/item', undefined, {params: {x: 1}});
    assert.equal(sent.at(-1).url, 'https://api.test/base/item?x=1&hook=1');
  }
  for (const method of ['post', 'put', 'patch']) {
    await request[method]('https://other.test/item', 0, {params: {x: 1}});
    assert.equal(sent.at(-1).method, method.toUpperCase());
    assert.equal(sent.at(-1).url, 'https://other.test/item?x=1&hook=1');
    assert.equal(sent.at(-1).data, 0);
  }
});

test('request errors, asynchronous rejection and explicit retry settle once with stage metadata', async () => {
  globalThis.wx = {request: ({fail}) => fail({errMsg: 'offline'})};
  assert.ok(isNetReqErr((await createRequest()('/item'))[1]));
  const rejectRequest = createRequest('', {interceptors: {async onResponseReject() {throw new Error('rejected asynchronously');}}});
  assert.equal((await rejectRequest('/item'))[1].message, 'rejected asynchronously');
  const before = createRequest('', {interceptors: {async onRequest() {throw new Error('before');}}});
  assert.ok(isNetReqErr((await before('/item'))[1]));
  const after = createRequest('', {interceptors: {async onResponseResolve() {throw new Error('after');}}});
  wx.request = ({success: resolve}) => resolve(success());
  assert.ok(isNetResErr((await after('/item'))[1]));
  let attempts = 0, beforeCount = 0;
  wx.request = ({success: resolve}) => {attempts++; resolve({...success(), statusCode: 401});};
  const retried = createRequest('', {interceptors: {
    onRequest() {beforeCount++;},
    async onResponseReject(error, {retryHandle}) {
      if (!retryHandle) {throw error;}
      const [ok, data] = await retryHandle();
      if (!ok) {throw data;}
      return data;
    },
  }});
  const failure = await retried('/item');
  assert.equal(failure[0], false);
  assert.equal(failure[1].statusCode, 401);
  assert.equal(attempts, 2);
  assert.equal(beforeCount, 2);
  await retried('/item', {retry: false});
  assert.equal(attempts, 3);
  assert.deepEqual(await showResponseErrMsg(new Error('unrelated')), [true, false]);
  const recovered = createRequest('', {interceptors: {async onResponseReject() {return 'fallback';}}});
  assert.deepEqual(await recovered('/item'), [true, 'fallback']);
  attempts = 0;
  wx.request = ({success: resolve}) => {attempts++; resolve({...success(), statusCode: attempts === 1 ? 401 : 200});};
  const successfulRetry = createRequest('', {interceptors: {async onResponseReject(error, {retryHandle}) {
    const first = retryHandle(), second = retryHandle();
    assert.equal(first, second);
    const [ok, value] = await first;
    if (!ok) {throw value;}
    return value;
  }}});
  assert.equal((await successfulRetry('/item'))[0], true);
  assert.equal(attempts, 2);
});

test('reusable calls share only in-flight work and release on rejection or sync throw', async () => {
  const gate = deferred();
  let count = 0;
  const reusable = reusableGetter(async key => {count++; await gate.promise; return [true, key];});
  const first = reusable('a'), second = reusable('a');
  assert.equal(first, second);
  gate.resolve();
  assert.deepEqual(await first, [true, 'a']);
  await reusable('a');
  assert.equal(count, 2);
  let failing = true;
  const rejects = reusableGetter(() => {
    if (failing) {return Promise.reject(new Error('failed'));}
    return [true, 2];
  });
  assert.equal((await rejects())[0], false);
  failing = false;
  assert.deepEqual(await rejects(), [true, 2]);
  const throwing = reusableGetter(() => {throw new Error('sync');});
  assert.ok((await throwing())[1] instanceof NetworkError);
  const circular = {}; circular.self = circular;
  assert.equal((await reusable(circular))[0], false);
  const custom = reusableGetter(async value => [true, value], {key: value => value});
  assert.equal((await custom(circular))[1], circular);
});

test('duplicate suppression is scoped by arguments or setter and always clears locks', async () => {
  const gate = deferred();
  const getter = debouncedGetter(async value => {await gate.promise; return [true, value];});
  const first = getter(1);
  assert.equal((await getter(1))[1]._neterr, 'cancelled');
  const different = getter(2);
  gate.resolve();
  assert.deepEqual(await first, [true, 1]);
  assert.deepEqual(await different, [true, 2]);
  assert.deepEqual(await getter(1), [true, 1]);
  let failing = true;
  const setter = debouncedSetter(async () => {if (failing) {throw new Error('failed');} return [true, 1];});
  assert.equal((await setter())[0], false);
  failing = false;
  assert.deepEqual(await setter(), [true, 1]);
  assert.equal((await setter.force())[0], false);
  const secondGate = deferred();
  const strict = debouncedGetter(async value => {await secondGate.promise; return [true, value];}, true);
  const active = strict(1);
  assert.equal((await strict(2))[0], false);
  secondGate.resolve(); await active;
  const forced = debouncedSetter(async value => [true, value], true);
  assert.deepEqual(await forced.force(1), [true, 1]);
});
