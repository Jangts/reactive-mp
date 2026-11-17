import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import os from 'node:os';
import path from 'node:path';
import {runWechatVerification} from '../scripts/lib/wechat-verification.mjs';

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
