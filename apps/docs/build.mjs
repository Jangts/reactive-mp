/** 从各公开包的唯一文档源稿构建独立站点与工作区入口。 */
import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  access,
  rm,
} from 'node:fs/promises';
import { expand, escapeHtml as escape, renderMarkdown } from './render.mjs';
import {
  assertOwnedPath,
  readSource,
  root,
  isInside,
} from '../../scripts/lib/workspace.mjs';
import {
  documentationSites,
  siteForPackage,
  sitePages,
} from './navigation.mjs';
import { renderPage } from './template.mjs';
import { buildPublicSite } from './public-site.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
export const output = 'apps/docs/dist';
export { expand } from './render.mjs';

/** 公开包输出目录可以单独部署，工作区入口位于总输出根目录。 */
export function outputFor(site, base = output) {
  return site.id === 'workspace' ? base : path.join(base, site.id);
}

/** 从 CLI 选择公开包；不允许将内部支撑包误作独立文档产品。 */
export function selectedPackage(args = process.argv.slice(2)) {
  const index = args.indexOf('--package');
  if (index < 0) {
    return undefined;
  }
  const name = args[index + 1];
  if (!name || name.startsWith('--')) {
    throw Error('--package requires a public package name or folder');
  }
  return name;
}

/** 只接受当前站点登记的正文链接，包 README 作为其概览别名。 */
function routesFor(site) {
  const routes = new Map(
    sitePages(site).map(([slug, , source]) => [source, slug]),
  );
  for (const pkg of site.documentation) {
    const overview = sitePages(pkg).find(([slug]) => slug === 'index')[2];
    routes.set(`${pkg.packageRoot}/README.md`, routes.get(overview));
  }
  return routes;
}

/** 构建一个上下文独立的站点，搜索索引仅包含该站点页面。 */
async function buildSite(site, base) {
  const directory = await assertOwnedPath(outputFor(site, base));
  await mkdir(path.join(directory, 'assets'), { recursive: true });
  for (const source of new Set(Object.values(site.branding))) {
    await copyFile(
      path.join(root, source),
      path.join(directory, 'assets', path.basename(source)),
    );
  }
  for (const name of ['styles.css', 'client.mjs']) {
    await copyFile(
      path.join(root, 'apps/docs', name),
      path.join(directory, 'assets', name.replace(/\.mjs$/, '.js')),
    );
  }
  const routes = routesFor(site);
  const searchIndex = [];
  for (const [slug, title, sourceFile] of sitePages(site)) {
    const source = await expand(
      await readSource(sourceFile, ['docs', 'packages', 'apps/docs']),
    );
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
        const page = routes.get(target);
        if (!page) {
          throw Error(
            `Unregistered ${site.id} documentation link: ${sourceFile} -> ${href}.md`,
          );
        }
        return `href="${page}.html${hash}"`;
      },
    );
    for (const match of body.matchAll(/href="([^"#]+)"/g)) {
      const href = match[1];
      if (/^[a-z]+:/i.test(href) || href.endsWith('.html')) {
        continue;
      }
      const file = path.posix.normalize(
        path.posix.join(path.posix.dirname(sourceFile), href),
      );
      if (!/^(?:packages|examples|tests|scripts)\//.test(file)) {
        continue;
      }
      const target = `source/${file}.html`;
      const code = await readSource(file);
      await mkdir(path.dirname(path.join(directory, target)), {
        recursive: true,
      });
      await writeFile(
        path.join(directory, target),
        `<!doctype html><meta charset="utf-8"><title>${escape(file)}</title><pre>${escape(code)}</pre>`,
      );
      body = body.replace(match[0], `href="${target}"`);
    }
    const sections = [];
    const headingIds = new Map();
    body = body.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level, content) => {
      const label = content.replace(/<[^>]+>/g, '');
      const baseId =
        label
          .toLocaleLowerCase()
          .replace(/[^\p{L}\p{N}\s_-]/gu, '')
          .trim()
          .replace(/\s+/g, '-') || 'section';
      const count = headingIds.get(baseId) ?? 0;
      headingIds.set(baseId, count + 1);
      const id = count ? `${baseId}-${count}` : baseId;
      if (level === '2') {
        sections.push({ id, label });
      }
      const link =
        level === '2'
          ? `<a class="heading-link" href="#${id}" aria-label="本节链接">#</a>`
          : '';
      return `<h${level} id="${id}">${content}${link}</h${level}>`;
    });
    const group = site.groups.find((item) =>
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
    await writeFile(
      path.join(directory, `${slug}.html`),
      renderPage({ site, slug, title, body, sections }),
    );
  }
  await writeFile(
    path.join(directory, 'assets/search-index.json'),
    JSON.stringify(searchIndex),
  );
}

/** 校验真实交付中的资源与锚点；独立站点不允许依赖相邻包或工作区文件。 */
async function verifySite(site, base) {
  const directory = path.resolve(root, outputFor(site, base));
  for (const [slug] of sitePages(site)) {
    const html = await readFile(path.join(directory, `${slug}.html`), 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^[a-z]+:/i.test(match[1])) {
        continue;
      }
      const [file, hash] = match[1].split('#');
      const target = path.resolve(directory, file || `${slug}.html`);
      if (!isInside(directory, target)) {
        throw Error(
          `${site.id}: documentation link leaves standalone site: ${match[1]}`,
        );
      }
      await access(target);
      if (hash && target.endsWith('.html')) {
        const destination = file ? await readFile(target, 'utf8') : html;
        if (!destination.includes(`id="${decodeURIComponent(hash)}"`)) {
          throw Error(
            `Missing section: ${site.id}/${slug}.html -> ${match[1]}`,
          );
        }
      }
    }
  }
}

/** 缺省构建全部站点，指定包时仅更新承载该包文档的站点。 */
export async function build({ packageName, outputRoot = output } = {}) {
  const relativeOutput = path
    .relative(root, path.resolve(root, outputRoot))
    .split(path.sep)
    .join('/');
  if (
    relativeOutput !== output &&
    !/^artifacts\/docs-[\w-]+$/.test(relativeOutput)
  ) {
    throw Error(
      'documentation output must be the generated docs directory or an artifacts/docs-* test directory',
    );
  }
  const sites = await documentationSites();
  const selected = packageName
    ? [siteForPackage(sites, packageName)].filter(Boolean)
    : sites;
  if (!selected.length || (packageName && selected[0].id === 'workspace')) {
    throw Error(`Unknown public documentation package: ${packageName}`);
  }
  const clean = await assertOwnedPath(
    packageName ? outputFor(selected[0], outputRoot) : outputRoot,
  );
  await rm(clean, { recursive: true, force: true });
  for (const site of selected) {
    if (site.packageName) {
      await mkdir(path.join(root, 'artifacts'), { recursive: true });
      await buildPublicSite(
        site,
        path.resolve(root, outputFor(site, outputRoot)),
      );
    } else {
      await buildSite(site, outputRoot);
    }
  }
  for (const site of selected) {
    if (!site.packageName) {
      await verifySite(site, outputRoot);
    }
    console.log(
      `Built ${sitePages(site).length} ${site.id} documentation pages in ${outputFor(site, outputRoot)}`,
    );
  }
  return selected;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await build({ packageName: selectedPackage() });
}
