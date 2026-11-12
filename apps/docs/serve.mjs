/** 仅监听回环地址的文档预览，合并重建请求并限制文件读取边界。 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { build, output } from './build.mjs';
import { readSource } from '../../scripts/lib/workspace.mjs';
await build();
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
      await build();
    } while (dirty);
  } catch (error) {
    console.error(error);
  } finally {
    building = false;
  }
}
for (const folder of ['docs', 'examples']) {
  watch(folder, { recursive: true }, (_, file) => {
    if (file?.includes('vendor/') || file?.includes('project.private')) {
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(rebuild, 100);
  });
}
const server = createServer(async (req, res) => {
  const file =
    new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!/^[\w./-]+\.html$/.test(file) || file.includes('..')) {
    res.writeHead(404);
    res.end();
    return;
  }
  try {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(await readSource(`${output}/${file}`, [output]));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () =>
  console.log('Docs: http://127.0.0.1:' + server.address().port),
);
