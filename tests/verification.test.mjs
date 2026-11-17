import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import os from 'node:os';
import path from 'node:path';
import {runWechatVerification, connectReadyWechat} from '../scripts/lib/wechat-verification.mjs';

test('WeChat startup failure replaces a stale success receipt with a current failure', async () => {
  const directory=await mkdtemp(path.join(os.tmpdir(),'rmp-evidence-'));
  const output=path.join(directory,'result.json');
  try {
    await writeFile(output,JSON.stringify({passed:true,stale:true}));
    await assert.rejects(()=>runWechatVerification({output,connect:async()=>{throw Error('synthetic startup failure');}},()=>{}),/synthetic startup failure/);
    const report=JSON.parse(await readFile(output,'utf8'));
    assert.equal(report.passed,false);
    assert.equal(report.stale,undefined);
    assert.match(report.failure,/synthetic startup failure/);
    assert.ok(Date.parse(report.finishedAt)>=Date.parse(report.startedAt));
  } finally {await rm(directory,{recursive:true,force:true});}
});

test('WeChat verification timeout records failure before the process exits', async () => {
  const directory=await mkdtemp(path.join(os.tmpdir(),'rmp-deadline-'));
  const output=path.join(directory,'result.json');
  try {
    await writeFile(output,JSON.stringify({passed:true,stale:true}));
    const source=`import {runWechatVerification} from ${JSON.stringify(new URL('../scripts/lib/wechat-verification.mjs',import.meta.url).href)};
      await runWechatVerification({output:${JSON.stringify(output)},timeout:20,connect:()=>new Promise(()=>{})},()=>{});`;
    await assert.rejects(()=>promisify(execFile)(process.execPath,['--input-type=module','-e',source],{timeout:10000}),error=>error.code===2);
    const report=JSON.parse(await readFile(output,'utf8'));
    assert.equal(report.passed,false);
    assert.equal(report.stale,undefined);
    assert.match(report.failure,/exceeded 20 ms/);
  } finally {await rm(directory,{recursive:true,force:true});}
});

test('WeChat CLI preparing failure with exit code zero records its real cause before connecting', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rmp-cli-failure-'));
  const output = path.join(directory, 'result.json');
  const cli = path.join(directory, 'fake-cli.mjs');
  try {
    await writeFile(cli, `#!/usr/bin/env node
      process.stderr.write('✖ preparing\\n[error] { code: 10, message: "需要重新登录" }\\n');
    `, { mode: 0o755 });
    const source = `import {runWechatVerification} from ${JSON.stringify(new URL('../scripts/lib/wechat-verification.mjs', import.meta.url).href)};
      await runWechatVerification({output:${JSON.stringify(output)},timeout:20000},()=>{});`;
    await assert.rejects(
      () => promisify(execFile)(process.execPath, ['--input-type=module', '-e', source], {
        env: { ...process.env, WECHAT_CLI: cli, WECHAT_WS_ENDPOINT: '' },
        timeout: 25000,
      }),
      error => /WeChat CLI could not enable automation/.test(error.stderr),
    );
    const report = JSON.parse(await readFile(output, 'utf8'));
    assert.equal(report.passed, false);
    assert.equal(report.environment, null);
    assert.deepEqual(report.checks, []);
    assert.match(report.failure, /需要重新登录/);
    assert.doesNotMatch(report.failure, /Failed connecting|exceeded/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('failed runtime readiness releases its connection while a ready session retains ownership', async () => {
  const failure = Error('runtime warming up');
  let disconnected = 0;
  const app = {
    async checkVersion() { throw failure; },
    async disconnect() { disconnected++; },
  };
  await assert.rejects(connectReadyWechat('unused', async () => app), error => error === failure);
  assert.equal(disconnected, 1);
  app.checkVersion = async () => {};
  assert.equal(await connectReadyWechat('unused', async () => app), app);
  assert.equal(disconnected, 1);
});
