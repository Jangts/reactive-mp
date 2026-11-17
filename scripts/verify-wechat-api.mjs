/** 在微信开发者工具验证独立 API 包的真实缓存、节点上下文和显式提示。 */
import assert from 'node:assert/strict';
import { runWechatVerification } from './lib/wechat-verification.mjs';

await runWechatVerification(
  { output: 'artifacts/wechat-api-live-verification.json', timeout: 45000 },
  async (app, report) => {
    const page = await app.reLaunch('/pages/wechat/index');
    await page.callMethod('checkStorage');
    const storage = JSON.parse(await page.data('result'));
    assert.deepEqual(
      storage.map((result) => result.value),
      [0, false, ''],
    );
    assert.ok(storage.every((result) => result.pass));
    report.checks.push({
      scene: 'native-storage-falsy-values',
      result: storage,
    });
    await page.$('#probe');
    await page.callMethod('checkRect');
    const rect = JSON.parse(await page.data('result'));
    assert.ok(rect.width > 0 && rect.height > 0);
    assert.equal(rect.id, 'probe');
    report.checks.push({ scene: 'native-page-selector-context', result: rect });
    await page.callMethod('toast');
    const toast = JSON.parse(await page.data('result'));
    assert.match(toast.errMsg, /ok/);
    report.checks.push({ scene: 'native-toast-callback', result: toast });
  },
);
