/** 微信工具验证入口，检查目标宿主及实际交互，不以连接成功代替验收。 */
import automator from 'miniprogram-automator';
import MiniProgramModule from 'miniprogram-automator/out/MiniProgram.js';
// Newer DevTools Tool.getInfo omits SDKVersion; validate the actual runtime
// version instead of passing undefined to the official SDK's comparison.
const MiniProgram = MiniProgramModule.default || MiniProgramModule;
MiniProgram.prototype.checkVersion = async function () {
  const info = await this.send('Tool.getInfo');
  const version = info.SDKVersion || (await this.systemInfo()).SDKVersion;
  if (version === 'dev') {
    return;
  }
  const parts = String(version).split('.').map(Number);
  if (
    !/^\d+\.\d+\.\d+/.test(String(version)) ||
    parts[0] < 2 ||
    (parts[0] === 2 && (parts[1] < 7 || (parts[1] === 7 && parts[2] < 3)))
  ) {
    throw Error(
      `Automator requires runtime SDKVersion >=2.7.3, received ${version}`,
    );
  }
};
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const host = process.argv[2] || 'integration';
if (!['integration', 'scenarios', 'playground'].includes(host)) {
  throw Error('unknown validation host');
}
const checks = [],
  errors = [];
let app;
const timeout = setTimeout(async () => {
  const error = 'WeChat verification exceeded 60 seconds';
  console.error(error);
  try {
    await mkdir('artifacts', { recursive: true });
    await writeFile(
      `artifacts/${host}-failure.json`,
      JSON.stringify({ host, checks, errors, error }, null, 2),
    );
    await Promise.race([
      app?.disconnect(),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ]);
  } finally {
    process.exit(1);
  }
}, 60000);
try {
  await mkdir('artifacts', { recursive: true });
  let endpoint = process.env.WECHAT_WS_ENDPOINT;
  if (!endpoint) {
    const port = { integration: 9420, scenarios: 9421, playground: 9422 }[host];
    await promisify(execFile)(
      process.env.WECHAT_CLI ||
        '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      [
        'auto',
        '--project',
        path.resolve('examples', host),
        '--auto-port',
        String(port),
        '--trust-project',
      ],
      { timeout: 30000 },
    );
    endpoint = `ws://127.0.0.1:${port}`;
  }
  app = await automator.connect({ wsEndpoint: endpoint });
  app.on('exception', (error) =>
    errors.push(String(error.message || JSON.stringify(error))),
  );
  console.log('Connected to WeChat runtime');
  if (host !== 'playground') {
    const actual = await app.evaluate(() => getApp().globalData.validationHost);
    assert.equal(
      actual,
      host,
      'automation endpoint must belong to the requested host',
    );
  }
  const route =
    host === 'playground' ? '/pages/home/index/index' : '/pages/index/index';
  const current = await app.currentPage();
  const page =
    current?.path === route.slice(1) ? current : await app.reLaunch(route);
  if (host === 'integration') {
    await page.callMethod('reset');
  }
  console.log('Validating page:', page.path);
  await page.waitFor(800);
  if (host === 'integration') {
    assert.equal(await page.data('double'), 0);
    checks.push('initial rendering');
    await (await page.$('button')).tap();
    await page.waitFor(300);
    assert.equal(await page.data('count'), 1);
    assert.equal(await page.data('double'), 2);
    checks.push('WXML event dispatch and computed rendering');
    const probes = await page.$$('probe');
    assert.equal(probes.length, 2);
    assert.match(await probes[0].data('label'), /parent=1, local=0/);
    await probes[0].callMethod('add');
    await page.waitFor(200);
    assert.match(await probes[0].data('label'), /local=1/);
    assert.match(await probes[1].data('label'), /local=0/);
    checks.push('ancestor injection and component isolation');
    await page.setData({ count: 5 });
    await page.waitFor(300);
    assert.equal(await page.data('double'), 10);
    checks.push('native setData feedback');
    assert.equal(
      (await page.callMethod('onShareAppMessage', {})).title,
      'Counter 5',
    );
    checks.push('return-valued page hook');
  } else if (host === 'scenarios') {
    await page.callMethod('reset');
    await page.callMethod('add');
    const second = await app.navigateTo('/pages/index/index');
    await second.waitFor(300);
    assert.equal(await second.data('quantity'), 1);
    assert.equal(await second.data('total'), 18);
    await second.callMethod('add');
    await app.navigateBack();
    await page.waitFor(200);
    assert.equal(await page.data('quantity'), 2);
    checks.push('shared store across page instances');
  } else {
    assert.equal(await page.data('name'), 'world');
    checks.push('migrated playground startup');
  }
  assert.deepEqual(errors, []);
  if (process.argv.includes('--screenshot')) {
    await app.screenshot({ path: `artifacts/${host}.png` });
  }
  await writeFile(
    `artifacts/${host}.json`,
    JSON.stringify({ host, checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ host, checks }, null, 2));
} catch (error) {
  await writeFile(
    `artifacts/${host}-failure.json`,
    JSON.stringify(
      { host, checks, errors, error: String(error.stack) },
      null,
      2,
    ),
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
  await app?.disconnect();
}
