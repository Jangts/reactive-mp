import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { marked } from 'marked';
import { navigation, navigationGroups } from './navigation.mjs';
import path from 'node:path';
export const output = 'apps/docs/dist';
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export async function expand(source) {
  return (await Promise.all(source.split('\n').map(async line => {
    if (!line.startsWith('<<< ')) return line;
    const file = line.slice(4).trim();
    const code = await readFile(file, 'utf8');
    return '```' + (file.endsWith('.js') ? 'js' : 'xml') + '\n' + code.trim() + '\n```';
  }))).join('\n');
}
export async function build() {
  await mkdir(output, { recursive: true });
  for (const [slug, title] of navigation) {
    const source = await expand(await readFile(`docs/${slug}.md`, 'utf8'));
    let body = marked.parse(source);
    body = body.replace(/href="([^"#]+)\.md(#[^"]*)?"/g, (_, href, hash = '') => `href="${path.basename(href)}.html${hash}"`);
    // Package source links are self-contained in the generated documentation.
    for (const match of body.matchAll(/href="\.\.\/((?:packages|examples|tests|scripts)\/[^"#]+)"/g)) {
      const file = match[1];
      const target = `source/${file}.html`;
      const code = await readFile(file, 'utf8');
      await mkdir(path.dirname(`${output}/${target}`), { recursive: true });
      await writeFile(`${output}/${target}`, `<!doctype html><meta charset="utf-8"><title>${escape(file)}</title><pre>${escape(code)}</pre>`);
      body = body.replace(match[0], `href="${target}"`);
    }
    const audience = navigationGroups.find(group => group.pages.some(([name]) => name === slug)).audience;
    const links = navigationGroups.filter(group => group.audience === audience).map(group =>
      `<section><h3>${group.title}</h3>` + group.pages.map(([name, label]) =>
        `<a ${name === slug ? 'aria-current="page"' : ''} href="${name}.html">${label}</a>`
      ).join('') + '</section>'
    ).join('') + (audience === 'reader'
      ? '<a href="architecture.html">维护者入口 →</a>'
      : '<a href="index.html">使用文档 →</a>');
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Reactive MP</title><style>
body{margin:0;color:#23302c;background:#fafbf9;font:16px/1.75 system-ui,sans-serif}aside{position:fixed;inset:0 auto 0 0;width:230px;padding:24px;background:#edf2ef;overflow:auto;box-sizing:border-box}aside strong{display:block;margin-bottom:20px}nav a{display:block;padding:7px;color:#315c4b;text-decoration:none}nav a[aria-current]{font-weight:bold;background:#dbe7e0;border-radius:6px}main{margin-left:230px;max-width:1000px;padding:32px 48px}pre{background:#eaf0ed;padding:20px;overflow:auto;border-radius:8px}code{font-family:ui-monospace,monospace}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #ccd9d0;padding:10px;text-align:left}a{color:#176348}h1,h2,h3{line-height:1.35} @media(max-width:720px){aside{position:static;width:auto}nav{display:flex;flex-wrap:wrap}main{margin:0;padding:20px}nav a{padding:5px 10px}}
</style></head><body><aside><strong>Reactive MP</strong><nav>${links}</nav></aside><main>${body}</main></body></html>`;
    await writeFile(`${output}/${slug}.html`, html);
  }
  console.log(`Built ${navigation.length} documentation pages in ${output}`);
}
if (process.argv[1]?.endsWith('build.mjs')) await build();
