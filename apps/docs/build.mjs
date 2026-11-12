/** 文档站构建：从正式源稿和导航生成页面，维护资料与使用入口分开。 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { expand, escapeHtml as escape, renderMarkdown } from './render.mjs';
import { assertOwnedPath, readSource } from '../../scripts/lib/workspace.mjs';
import { navigation, navigationGroups } from './navigation.mjs';
import path from 'node:path';
export const output = 'apps/docs/dist';
export { expand } from './render.mjs';
export async function build() {
  const styles = await readFile(
    new URL('./styles.css', import.meta.url),
    'utf8',
  );
  await assertOwnedPath(output);
  await mkdir(output, { recursive: true });
  for (const [slug, title] of navigation) {
    const source = await expand(await readFile(`docs/${slug}.md`, 'utf8'));
    let body = renderMarkdown(source);
    body = body.replace(
      /href="([^"#]+)\.md(#[^"]*)?"/g,
      (_, href, hash = '') => `href="${path.basename(href)}.html${hash}"`,
    );
    // Package source links are self-contained in the generated documentation.
    for (const match of body.matchAll(
      /href="\.\.\/((?:packages|examples|tests|scripts)\/[^"#]+)"/g,
    )) {
      const file = match[1];
      const target = `source/${file}.html`;
      const code = await readSource(file);
      await mkdir(path.dirname(`${output}/${target}`), { recursive: true });
      await writeFile(
        `${output}/${target}`,
        `<!doctype html><meta charset="utf-8"><title>${escape(file)}</title><pre>${escape(code)}</pre>`,
      );
      body = body.replace(match[0], `href="${target}"`);
    }
    const audience = navigationGroups.find((group) =>
      group.pages.some(([name]) => name === slug),
    ).audience;
    const links =
      navigationGroups
        .filter((group) => group.audience === audience)
        .map(
          (group) =>
            `<section><h3>${group.title}</h3>` +
            group.pages
              .map(
                ([name, label]) =>
                  `<a ${name === slug ? 'aria-current="page"' : ''} href="${name}.html">${label}</a>`,
              )
              .join('') +
            '</section>',
        )
        .join('') +
      (audience === 'reader'
        ? '<a href="architecture.html">维护者入口 →</a>'
        : '<a href="index.html">使用文档 →</a>');
    const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} · Reactive MP</title><style>${styles}</style></head><body><aside><strong>Reactive MP</strong><nav>${links}</nav></aside><main>${body}</main></body></html>`;
    await writeFile(`${output}/${slug}.html`, html);
  }
  console.log(`Built ${navigation.length} documentation pages in ${output}`);
}
if (process.argv[1]?.endsWith('build.mjs')) {
  await build();
}
