import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const exec = promisify(execFile);
const root = process.cwd(), temp = await mkdtemp(path.join(os.tmpdir(), 'reactive-mp-pack-'));
const env = { ...process.env, npm_config_cache: path.join(os.tmpdir(), 'reactive-mp-package-cache') };
try {
  const archives = [];
  for (const name of ['shared', 'reactivity', 'store', 'runtime', 'reactive-mp']) {
    const { stdout } = await exec('npm', ['pack', `./packages/${name}`, '--json', '--pack-destination', temp, '--ignore-scripts'], { cwd: root, env });
    const [result] = JSON.parse(stdout);
    if (!result.files.some(file => file.path === 'index.d.ts')) throw Error(`${name}: missing declarations`);
    archives.push(path.join(temp, result.filename));
  }
  const consumer = path.join(temp, 'consumer'); await mkdir(consumer);
  await writeFile(path.join(consumer, 'package.json'), '{"private":true,"type":"module"}');
  await exec('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', ...archives], { cwd: consumer, env });
  await writeFile(path.join(consumer, 'verify.mjs'), `
    import assert from 'node:assert/strict';
    import { useSignal, computed, defineStore, defineComponent } from 'reactive-mp';
    const [n,set]=useSignal(1); const double=computed(()=>n()*2); set(3); assert.equal(double(),6);
    const use=defineStore('consumer',()=>({n})); assert.equal(use().n(),3); use.dispose();
    globalThis.Behavior=options=>options;
    globalThis.Component=options=>assert.equal(options.data.n,3);
    defineComponent(()=>({n}));
  `);
  await exec(process.execPath, ['verify.mjs'], { cwd: consumer, env });
  console.log('Five packed packages installed and verified in an isolated offline consumer');
} finally { await rm(temp, { recursive: true, force: true }); }
