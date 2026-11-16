/** 在真实平台验证内部混写、跨原生容器组合、双向页面导航及销毁清理。 */
import assert from 'node:assert/strict';

async function waitForPage(app, path) {
  const deadline = Date.now() + 5000;
  let page;
  do {
    page = await app.currentPage();
    if (page?.path === path) {
      await page.waitFor(200);
      return page;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (Date.now() < deadline);
  assert.equal(page?.path, path, 'navigation must reach the requested page');
}

export async function verifyMixedUsage(app, checks) {
  const active = () => app.evaluate(() => getApp().globalData.mixedActive);
  const initialActive = await active();
  const mixedPage = await app.navigateTo('/pages/mixed/index');
  await mixedPage.waitFor(300);
  await mixedPage.callMethod('incrementRaw');
  await mixedPage.callMethod('incrementReactive');
  await mixedPage.waitFor(100);
  assert.equal(await mixedPage.data('count'), 2);
  assert.equal(await mixedPage.data('double'), 4);
  assert.equal(await mixedPage.data('vanilla'), 1);
  const loads = await app.evaluate(() => getApp().globalData.mixedLoads);
  assert.equal(loads.native, loads.hook);
  assert.ok(loads.hook > 0);
  assert.equal(await active(), initialActive + 2);
  checks.push(
    'MIX-01 definePage: raw data/methods/setData and reactive state/lifecycles',
  );

  for (const pageKind of ['mixed', 'vanilla']) {
    const page = await app.currentPage();
    assert.equal(page.path, `pages/${pageKind}/index`);
    const component = await page.$('#mixed');
    const raw = await page.$('#raw');
    await component.callMethod('incrementRaw');
    await component.callMethod('incrementReactive');
    await raw.callMethod('incrementRaw');
    await page.setData({ prefix: 'updated' });
    await page.waitFor(200);
    assert.equal(await component.data('count'), 2);
    assert.equal(await component.data('vanilla'), 1);
    assert.equal(await component.data('label'), 'updated:2');
    assert.equal(await component.data('readyCount'), 1);
    assert.equal(await raw.data('count'), 1);
    assert.equal(await page.data('events'), 3);
    assert.equal(await page.data('lastValue'), 1);
    const report = await app.evaluate(() => {
      const page = getCurrentPages().slice(-1)[0];
      return page.selectComponent('#wrapper').selectComponent('#nested').data
        .label;
    });
    assert.equal(report, 'updated:0');
    const before = await active();
    await page.callMethod('toggle');
    await page.waitFor(200);
    assert.equal(await active(), before - 2);
    await page.callMethod('toggle');
    await page.waitFor(200);
    assert.equal(await active(), before);
    assert.equal(await (await page.$('#mixed')).data('count'), 0);
    checks.push(
      `MIX-02/03 ${pageKind}: component raw/reactive state, props, events, vanilla container and remount`,
    );
    await page.callMethod('openOther');
    await waitForPage(
      app,
      pageKind === 'mixed' ? 'pages/vanilla/index' : 'pages/mixed/index',
    );
  }
  // 原生页也已打开 definePage；依次退回，确认隐藏页保留实例、卸载页释放实例。
  assert.equal((await app.currentPage()).path, 'pages/mixed/index');
  for (const path of [
    'pages/vanilla/index',
    'pages/mixed/index',
    'pages/index/index',
  ]) {
    await app.navigateBack();
    await waitForPage(app, path);
  }
  assert.equal(await active(), initialActive);
  checks.push(
    'MIX-04 native Page ↔ definePage navigation and complete component cleanup',
  );
}
