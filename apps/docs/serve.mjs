import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { build, output } from './build.mjs';
await build();
let queued = Promise.resolve();
for (const folder of ['docs', 'examples']) watch(folder, { recursive: true }, (_, file) => {
  if (file?.includes('vendor/') || file?.includes('project.private')) return;
  queued = queued.then(build).catch(console.error);
});
const server = createServer(async (req, res) => {
  const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!/^[\w./-]+\.html$/.test(file) || file.includes("..")) { res.writeHead(404); res.end(); return; }
  try { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(await readFile(`${output}/${file}`)); }
  catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Docs: http://127.0.0.1:' + server.address().port));
