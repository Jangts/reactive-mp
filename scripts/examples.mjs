/** 准备原生开发宿主：按真实包 exports 改写导入，阶段化替换工具拥有的 vendor。 */
import { mkdir, readdir, rm, mkdtemp, rename, lstat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { prepareNativeSources } from 'reactive-mp/native-tools';
import {
  root,
  workspacePackages,
  workspaceHosts,
  assertOwnedPath,
} from './lib/workspace.mjs';

/** 在完整 staging 上准备产物，再切换目录；失败恢复旧 vendor，不删除用户文件。 */
async function prepareHost(host, packages) {
  const hostRoot = await assertOwnedPath(`examples/${host}`);
  const vendor = await assertOwnedPath(`examples/${host}/vendor`);
  const staging = await mkdtemp(path.join(hostRoot, '.vendor-stage-'));
  const previous = `${staging}-previous`;
  let moved = false;
  const byName = new Map(
    packages.map((pkg) => [
      pkg.manifest.name,
      { ...pkg, root: path.join(root, 'packages', pkg.folder) },
    ]),
  );
  try {
    await prepareNativeSources(staging, byName);
    try {
      await lstat(vendor);
      // 只接管有标记的目录或旧版工具仅含已知包的产物；未知内容保持原样。
      const entries = await readdir(vendor);
      const known = new Set([
        ...packages.map((pkg) => pkg.folder),
        '.reactive-mp-generated',
      ]);
      if (entries.some((name) => !known.has(name))) {
        throw Error(`vendor contains unowned files: ${host}`);
      }
      await rename(vendor, previous);
      moved = true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
    try {
      await rename(staging, vendor);
    } catch (error) {
      if (moved) {
        await rename(previous, vendor);
      }
      moved = false;
      throw error;
    }
    if (moved) {
      await rm(previous, { recursive: true, force: true });
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}

/** 串行准备全部宿主，防止同一进程的 watch 操作相互覆盖。 */
async function prepare() {
  const packages = await workspacePackages();
  const hosts = await workspaceHosts();
  const lock = await assertOwnedPath('artifacts/examples-prepare.lock');
  await mkdir(path.dirname(lock), { recursive: true });
  try {
    await mkdir(lock);
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw Error(
        'another examples preparation is active; stop concurrent preparation first',
      );
    }
    throw error;
  }
  try {
    for (const host of hosts) {
      await prepareHost(host, packages);
    }
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
  console.log(`Prepared workspace sources for: ${hosts.join(', ')}`);
}
await prepare();
if (process.argv.includes('--watch')) {
  let running = false;
  let queued = false;
  let timer;
  async function update() {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      do {
        queued = false;
        await prepare();
      } while (queued);
    } catch (error) {
      console.error(error);
    } finally {
      running = false;
    }
  }
  watch(path.join(root, 'packages'), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(update, 100);
  });
  console.log('Watching packages; open examples/* in WeChat DevTools.');
}
