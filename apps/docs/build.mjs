/** 文档站构建：从正式源稿和导航生成页面，维护资料与使用入口分开。 */
import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { expand, escapeHtml as escape, renderMarkdown } from './render.mjs';
import { assertOwnedPath, readSource } from '../../scripts/lib/workspace.mjs';
import { navigation, navigationGroups, sourceForPage } from './navigation.mjs';
import { renderPage } from './template.mjs';
import path from 'node:path';
export const output = 'apps/docs/dist';
export { expand } from './render.mjs';
export async function build() {
  await assertOwnedPath(output);
  await mkdir(output, { recursive: true });
  await mkdir(`${output}/assets`, { recursive: true });
  for (const name of ['reactive-mp-icon.svg', 'reactive-mp-logo.svg']) {
    await copyFile(`docs/assets/branding/${name}`, `${output}/assets/${name}`);
  }
  for (const name of ['styles.css', 'client.mjs']) {
    await copyFile(`apps/docs/${name}`, `${output}/assets/${name}`);
  }
  const searchIndex = [];
  for (const [slug, title] of navigation) {
    const sourceFile = sourceForPage(slug);
    const source = await expand(await readFile(sourceFile, 'utf8'));
    let body = renderMarkdown(source);
    body = body.replace(
      /href="([^"#]+)\.md(#[^"]*)?"/g,
      (_, href, hash = '') => {
        if (/^[a-z]+:/i.test(href)) {
          return `href="${href}.md${hash}"`;
        }
        const target = path.posix.normalize(
          path.posix.join(path.posix.dirname(sourceFile), `${href}.md`),
        );
        const page = navigation.find(
          ([name]) => sourceForPage(name) === target,
        );
        if (!page) {
          throw Error(
            `Unregistered documentation link: ${sourceFile} -> ${href}.md`,
          );
        }
        return `href="${page[0]}.html${hash}"`;
      },
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
    const sections = [];
    const headingIds = new Map();
    body = body.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level, content) => {
      const label = content.replace(/<[^>]+>/g, '');
      const base =
        label
          .toLocaleLowerCase()
          .replace(/[^\p{L}\p{N}\s_-]/gu, '')
          .trim()
          .replace(/\s+/g, '-') || 'section';
      const count = headingIds.get(base) ?? 0;
      headingIds.set(base, count + 1);
      const id = count ? `${base}-${count}` : base;
      if (level === '2') {
        sections.push({ id, label });
      }
      const link =
        level === '2'
          ? `<a class="heading-link" href="#${id}" aria-label="本节链接">#</a>`
          : '';
      return `<h${level} id="${id}">${content}${link}</h${level}>`;
    });
    const group = navigationGroups.find((item) =>
      item.pages.some(([name]) => name === slug),
    );
    searchIndex.push({
      title,
      href: `${slug}.html`,
      group: group.title,
      text: source
        .replace(/^<<< .*$/gm, '')
        .replace(/[`#*|]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    });
    const html = renderPage({ slug, title, body, sections });
    await writeFile(`${output}/${slug}.html`, html);
  }
  await writeFile(
    `${output}/assets/search-index.json`,
    JSON.stringify(searchIndex),
  );
  // 验证最终页面的资源与站内链接，防止源稿存在但站点路由缺失。
  for (const [slug] of navigation) {
    const html = await readFile(`${output}/${slug}.html`, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^[a-z]+:/i.test(match[1])) {
        continue;
      }
      const [file, hash] = match[1].split('#');
      const target = file || `${slug}.html`;
      await access(`${output}/${target}`);
      if (hash && target.endsWith('.html')) {
        const destination = file
          ? await readFile(`${output}/${target}`, 'utf8')
          : html;
        if (!destination.includes(`id="${decodeURIComponent(hash)}"`)) {
          throw Error(`Missing section: ${slug}.html -> ${match[1]}`);
        }
      }
    }
  }

  console.log(`Built ${navigation.length} documentation pages in ${output}`);
}
if (process.argv[1]?.endsWith('build.mjs')) {
  await build();
}
