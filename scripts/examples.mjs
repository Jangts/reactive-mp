import { cp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const packages = ['shared', 'reactivity', 'store', 'runtime', 'reactive-mp'];
const hosts = ['playground', 'integration', 'scenarios'];
async function walk(dir) {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...await walk(full));
    else result.push(full);
  }
  return result;
}
async function prepare() {
  for (const host of hosts) {
    const vendor = path.join(root, 'examples', host, 'vendor');
    await mkdir(vendor, { recursive: true });
    for (const pkg of packages) {
      const target = path.join(vendor, pkg);
      await rm(target, { recursive: true, force: true });
      await cp(path.join(root, 'packages', pkg, 'src'), path.join(target, 'src'), { recursive: true });
      for (const file of await walk(path.join(target, 'src'))) if (file.endsWith('.js')) {
        let source = await readFile(file, 'utf8');
        source = source.replace(/(from\s+['"])(@reactive-mp\/[\w-]+)([^'"]*)(['"])/g,
          (_, prefix, name, subpath, quote) => {
            const dest = path.join(vendor, name.split('/')[1], 'src', subpath ? subpath.slice(1) + '.js' : 'index.js');
            let relative = path.relative(path.dirname(file), dest).split(path.sep).join('/');
            if (!relative.startsWith('.')) relative = './' + relative;
            return prefix + relative + quote;
          });
        await writeFile(file, source);
      }
    }
  }
  console.log('Prepared workspace sources for: ' + hosts.join(', '));
}
await prepare();
if (process.argv.includes('--watch')) {
  let running = false, queued = false;
  async function update() {
    if (running) { queued = true; return; }
    running = true;
    try { do { queued = false; await prepare(); } while (queued); }
    catch (error) { console.error(error); }
    finally { running = false; }
  }
  let timer;
  watch(path.join(root, 'packages'), { recursive: true }, () => {
    clearTimeout(timer); timer = setTimeout(update, 100);
  });
  console.log('Watching packages; open any examples/* project in WeChat DevTools.');
}
