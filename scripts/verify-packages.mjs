/** 在临时隔离消费者中安装真实 tarball，验证包体和导入。 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { workspacePackages } from './lib/workspace.mjs';
const exec = promisify(execFile);
const root = process.cwd(),
  temp = await mkdtemp(path.join(os.tmpdir(), 'reactive-mp-pack-'));
const env = {
  ...process.env,
  npm_config_cache: path.join(os.tmpdir(), 'reactive-mp-package-cache'),
};
try {
  const archives = [];
  for (const { folder: name } of await workspacePackages()) {
    const { stdout } = await exec(
      'npm',
      [
        'pack',
        `./packages/${name}`,
        '--json',
        '--pack-destination',
        temp,
        '--ignore-scripts',
      ],
      { cwd: root, env },
    );
    const [result] = JSON.parse(stdout);
    if (!result.files.some((file) => file.path === 'index.d.ts')) {
      throw Error(`${name}: missing declarations`);
    }
    archives.push(path.join(temp, result.filename));
  }
  const consumer = path.join(temp, 'consumer');
  await mkdir(consumer);
  await writeFile(
    path.join(consumer, 'package.json'),
    '{"private":true,"type":"module"}',
  );
  await exec(
    'npm',
    [
      'install',
      '--offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...archives,
    ],
    { cwd: consumer, env },
  );
  await writeFile(
    path.join(consumer, 'verify.mjs'),
    `
    import assert from 'node:assert/strict';
    import { useSignal, computed, defineStore, defineComponent } from 'reactive-mp';
    const [n,set]=useSignal(1); const double=computed(()=>n()*2); set(3); assert.equal(double(),6);
    const use=defineStore('consumer',()=>({n})); assert.equal(use().n(),3); use.dispose();
    globalThis.Behavior=options=>options;
    globalThis.Component=options=>assert.equal(options.data.n,3);
    defineComponent(()=>({n}));
  `,
  );
  await exec(process.execPath, ['verify.mjs'], { cwd: consumer, env });
  await exec(
    process.execPath,
    [
      'node_modules/reactive-mp/tools/prepare-native.mjs',
      '--out',
      './mini/vendor',
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    const core = await import('./mini/vendor/reactive-mp/src/index.js');
    const [value, set] = core.useSignal(2);
    const double = core.computed(() => value() * 2);
    set(3);
    if (double() !== 6) throw Error('native package graph failed');
  `,
    ],
    { cwd: consumer, env },
  );
  console.log(
    'Five packed packages installed and verified in an isolated offline consumer',
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
