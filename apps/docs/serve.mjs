/** 仅监听回环地址的文档预览，合并重建请求并限制文件读取边界。 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { outputFor, selectedPackage } from './build.mjs';
import { documentationSites } from './navigation.mjs';
import { readSource, root } from '../../scripts/lib/workspace.mjs';
const packageName = selectedPackage();
const sites = await documentationSites();
const site = packageName
  ? sites.find(
      (item) => item.packageName === packageName || item.id === packageName,
    )
  : sites[0];
if (!site || (packageName && !site.packageName)) {
  throw Error(`Unknown public documentation package: ${packageName}`);
}
const output = outputFor(site);
await buildDocs();
/** 独立进程读取最新构建和模板代码，避免 ESM 模块缓存导致源码修改不生效。 */
function buildDocs() {
  return new Promise((resolve, reject) => {
    const args = [
      'apps/docs/build.mjs',
      ...(packageName ? ['--package', packageName] : []),
    ];
    const child = spawn(process.execPath, args, {
      cwd: root,
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(Error(`Documentation build exited with code ${code}`));
      }
    });
  });
}
let building = false;
let dirty = false;
let timer;
async function rebuild() {
  if (building) {
    dirty = true;
    return;
  }
  building = true;
  try {
    do {
      dirty = false;
      await buildDocs();
    } while (dirty);
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
  }
}
for (const folder of ['docs', 'packages', 'examples', 'apps/docs']) {
  watch(
    new URL('../../' + folder + '/', import.meta.url),
    { recursive: true },
    (_, file) => {
      if (
        file === 'dist' ||
        file?.startsWith('dist/') ||
        file?.includes('vendor/') ||
        file?.includes('project.private')
      ) {
        return;
      }
      clearTimeout(timer);
      timer = setTimeout(rebuild, 100);
    },
  );
}
const server = createServer(async (req, res) => {
  let file =
    new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (file.endsWith('/')) {
    file += 'index.html';
  }
  const contentTypes = {
    html: 'text/html',
    css: 'text/css',
    mjs: 'text/javascript',
    svg: 'image/svg+xml',
    json: 'application/json',
  };
  const type = contentTypes[file.split('.').at(-1)];
  if (!type || !/^[\w./-]+$/.test(file) || file.includes('..')) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    res.setHeader('Content-Type', `${type}; charset=utf-8`);
    res.end(await readSource(`${output}/${file}`, [output]));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () =>
  console.log(`${site.title} docs: http://127.0.0.1:` + server.address().port),
);
