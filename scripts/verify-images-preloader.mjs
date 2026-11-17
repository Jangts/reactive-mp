/** 在真实微信模拟器验证隐藏图片加载、缓存、跨实例共享与清理；截图按参数启用。 */
import assert from 'node:assert/strict';
import { runWechatVerification } from './lib/wechat-verification.mjs';

await runWechatVerification(
  {
    output: 'artifacts/images-preloader-live-verification.json',
    timeout: 45000,
  },
  async (app, report) => {
    const page = await app.reLaunch('/pages/images-preloader/index');
    await page.callMethod('clearCache');
    await page.callMethod('preload');
    let result = JSON.parse(await page.data('report'));
    assert.deepEqual([result.total, result.done, result.fail], [3, 3, 0]);
    assert.ok(
      result.results.every((image) => image.width > 0 && image.height > 0),
    );
    assert.deepEqual(JSON.parse(await page.data('size')), {
      width: result.results[0].width,
      height: result.results[0].height,
    });
    report.checks.push({ scene: 'hidden-images-load', result });

    const cached = await app.evaluate(function () {
      const loader = getCurrentPages()
        .slice(-1)[0]
        .selectComponent('#preloader');
      const promise = loader.loadImages(['/assets/video/orbit.jpg']);
      return Promise.resolve().then(function () {
        const jobs = loader.data.images.length;
        return promise.then(function (report) {
          return {
            jobs: jobs,
            report: report,
            remaining: loader.data.images.length,
          };
        });
      });
    });
    assert.equal(cached.jobs, 0);
    assert.equal(cached.remaining, 0);
    assert.equal(cached.report.done, 1);
    report.checks.push({ scene: 'cache-without-native-nodes', result: cached });

    await page.callMethod('toggleError');
    await page.callMethod('preload');
    result = JSON.parse(await page.data('report'));
    assert.deepEqual([result.total, result.done, result.fail], [4, 3, 1]);
    assert.equal(result.results.at(-1).status, 'error');
    const remaining = await app.evaluate(function () {
      return getCurrentPages().slice(-1)[0].selectComponent('#preloader').data
        .images;
    });
    assert.deepEqual(remaining, []);
    report.checks.push({ scene: 'native-image-error-and-cleanup', result });

    await page.callMethod('clearCache');
    const shared = await app.evaluate(function () {
      const page = getCurrentPages().slice(-1)[0];
      const first = page.selectComponent('#preloader');
      const second = page.selectComponent('#peer-preloader');
      const a = first.loadImages(['/assets/video/orbit.jpg']);
      const b = second.loadImages(['/assets/video/orbit.jpg']);
      return Promise.resolve().then(function () {
        const jobs = [first.data.images.length, second.data.images.length];
        return Promise.all([a, b]).then(function (reports) {
          return {
            jobs: jobs,
            reports: reports,
            remaining: [first.data.images.length, second.data.images.length],
          };
        });
      });
    });
    assert.deepEqual(shared.jobs, [1, 0]);
    assert.ok(shared.reports.every((batch) => batch.done === 1));
    assert.deepEqual(shared.remaining, [0, 0]);
    report.checks.push({ scene: 'native-shared-request', result: shared });

    await page.callMethod('clearCache');
    const cancelled = await app.evaluate(function () {
      const page = getCurrentPages().slice(-1)[0];
      const loader = page.selectComponent('#preloader');
      const promise = loader.loadImages([
        '/assets/video/orbit.jpg',
        '/assets/video/bounce.jpg',
      ]);
      page.toggleMount();
      return promise;
    });
    assert.equal(cancelled.fail, 2);
    assert.ok(cancelled.results.every((image) => image.status === 'cancelled'));
    report.checks.push({
      scene: 'native-detach-settles-batch',
      result: cancelled,
    });

    await page.callMethod('toggleMount');
    const owner = await page.$('#preloader');
    assert.ok(owner, 'preloader did not remount');
    await page.callMethod('clearCache');
    const transferred = await app.evaluate(function () {
      const page = getCurrentPages().slice(-1)[0];
      const first = page.selectComponent('#preloader');
      const second = page.selectComponent('#peer-preloader');
      const a = first.loadImages(['/assets/video/orbit.jpg']);
      const b = second.loadImages(['/assets/video/orbit.jpg']);
      page.toggleMount();
      return Promise.all([a, b]).then(function (reports) {
        return { reports: reports, remaining: second.data.images.length };
      });
    });
    assert.equal(transferred.reports[0].results[0].status, 'cancelled');
    assert.equal(transferred.reports[1].done, 1);
    assert.equal(transferred.remaining, 0);
    report.checks.push({
      scene: 'native-transfer-on-detach',
      result: transferred,
    });

    if (process.argv.includes('--screenshot')) {
      await app.screenshot({ path: 'artifacts/images-preloader-live.png' });
    }
  },
);
