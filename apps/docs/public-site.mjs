/** 公开文档站沿用既有 VitePress 主题，提供完整中英文路由、源码页与本地搜索。 */
import {
  mkdir,
  readFile,
  writeFile,
  copyFile,
  mkdtemp,
  rm,
  readdir,
  access,
} from 'node:fs/promises';
import path from 'node:path';
import { build as vitepressBuild } from 'vitepress';
import { expand } from './render.mjs';
import { sitePages } from './navigation.mjs';
import { readSource, root, isInside } from '../../scripts/lib/workspace.mjs';

/** 检查完整成品中的导航、语言互链、资源与锚点，不以渲染成功代替交付检查。 */
export async function verifyPublicSite(directory) {
  const { base = '/' } = JSON.parse(
    await readFile(path.join(directory, 'site-manifest.json'), 'utf8'),
  );
  async function files(folder) {
    const result = [];
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) {
        result.push(...(await files(file)));
      } else if (entry.name.endsWith('.html')) {
        result.push(file);
      }
    }
    return result;
  }
  for (const file of await files(directory)) {
    const html = await readFile(file, 'utf8');
    const route = path.relative(directory, file).split(path.sep).join('/');
    for (const [, href] of html.matchAll(/(?:href|src)="([^\"]+)"/g)) {
      if (/^[a-z]+:|^\/\//i.test(href)) {
        continue;
      }
      const url = new URL(
        href.replaceAll('&amp;', '&'),
        'https://docs.invalid' + base + route,
      );
      const pathname = decodeURIComponent(url.pathname).replace(
        /\/$/,
        '/index.html',
      );
      if (!pathname.startsWith(base)) {
        throw Error(`${route}: resource leaves configured base: ${href}`);
      }
      const target = path.resolve(directory, pathname.slice(base.length));
      if (!isInside(directory, target)) {
        throw Error(`${route}: resource escapes standalone site: ${href}`);
      }
      await access(target);
      if (url.hash && target.endsWith('.html')) {
        const body = target === file ? html : await readFile(target, 'utf8');
        if (!body.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) {
          throw Error(`${route}: missing section ${href}`);
        }
      }
    }
  }
}

export const locales = ['zh', 'en'];
export function localizedSource(source, locale) {
  return locale === 'en' ? source.replace('/docs/', '/docs/en/') : source;
}
export function languageEntry(route = '') {
  return `(()=>{let l;try{l=localStorage.getItem('reactive-mp-docs-language')}catch{}if(l!=='zh'&&l!=='en')l=/^zh\\b/i.test(navigator.language||'')?'zh':'en';location.replace('./'+l+'/'+${JSON.stringify(route)}+location.search+location.hash)})()`;
}

/** 构建输入只从已登记的各包文档读取，语言缺失与跨站相对链接均拒绝。 */
export async function buildPublicSite(site, directory) {
  const base = process.env.DOCS_BASE || '/';
  if (
    !/^\/(?:[a-zA-Z0-9._~-]+\/)*$/.test(base) ||
    base.split('/').includes('..')
  ) {
    throw Error(
      'DOCS_BASE must be a slash-delimited path with a trailing slash',
    );
  }
  const stage = await mkdtemp(path.join(root, 'artifacts/docs-vitepress-'));
  try {
    const content = path.join(stage, 'content');
    const configRoot = path.join(stage, '.vitepress');
    await mkdir(path.join(configRoot, 'theme'), { recursive: true });
    await mkdir(path.join(content, 'public/branding'), { recursive: true });
    for (const asset of new Set(Object.values(site.branding))) {
      await copyFile(
        path.join(root, asset),
        path.join(content, 'public/branding', path.basename(asset)),
      );
    }
    for (const file of ['index.mjs', 'style.css']) {
      await copyFile(
        path.join(root, 'apps/docs/theme', file),
        path.join(configRoot, 'theme', file),
      );
    }
    const sourceRoutes = new Map();
    for (const locale of locales) {
      for (const [slug, , source] of sitePages(site)) {
        sourceRoutes.set(localizedSource(source, locale), `${locale}/${slug}`);
      }
    }
    for (const locale of locales) {
      for (const [slug, title, original, englishTitle] of sitePages(site)) {
        const source = localizedSource(original, locale);
        let markdown = await expand(await readSource(source, ['packages']));
        const output = `${locale}/${slug}`;
        const links = [...markdown.matchAll(/\]\(([^)]+)\)/g)];
        for (const match of links) {
          const [href, hash] = match[1].split('#');
          if (!href || /^[a-z]+:/i.test(href)) {
            continue;
          }
          const target = path.posix.normalize(
            path.posix.join(path.posix.dirname(source), href),
          );
          let route = sourceRoutes.get(target);
          const packageReadme = site.documentation.find(
            (pkg) => target === `${pkg.packageRoot}/README.md`,
          );
          if (packageReadme) {
            route = sourceRoutes.get(
              localizedSource(
                `${packageReadme.packageRoot}/docs/index.md`,
                locale,
              ),
            );
          }
          if (!route && !href.endsWith('.md')) {
            const code = await readSource(target);
            route = `${locale}/source/${target}`;
            const destination = path.join(content, route + '.md');
            await mkdir(path.dirname(destination), { recursive: true });
            const fence = '`'.repeat(
              Math.max(
                3,
                ...[...code.matchAll(/`+/g)].map((m) => m[0].length + 1),
              ),
            );
            await writeFile(
              destination,
              `# ${target}\n\n${fence}${target.endsWith('.ts') ? 'ts' : 'js'}\n${code}\n${fence}\n`,
            );
          }
          if (!route) {
            throw Error(`${source}: unregistered documentation link ${href}`);
          }
          const relative = path.posix.relative(
            path.posix.dirname(output),
            route + '.md',
          );
          markdown = markdown.replace(
            match[0],
            `](${relative}${hash ? '#' + hash : ''})`,
          );
        }
        if (slug === 'index') {
          const frontmatter = {
            layout: 'home',
            hero: {
              name: site.title,
              text: locale === 'zh' ? site.description : site.descriptionEn,
              tagline: `${site.packageName} · v${site.version}`,
              image: {
                src: '/branding/' + path.basename(site.branding.logo),
                alt: site.title,
              },
              actions: [
                {
                  theme: 'brand',
                  text: locale === 'zh' ? '快速上手' : 'Get started',
                  link: `/${locale}/getting-started.html`,
                },
                {
                  theme: 'alt',
                  text: locale === 'zh' ? '浏览参考' : 'Explore the reference',
                  link: `/${locale}/${site.id === 'components' ? 'catalog' : 'api'}.html`,
                },
              ],
            },
          };
          markdown =
            `---\n${JSON.stringify(frontmatter)}\n---\n\n` +
            markdown.replace(/^# .+\n/, '');
        }
        await mkdir(path.join(content, locale), { recursive: true });
        await writeFile(path.join(content, output + '.md'), markdown);
      }
    }
    await writeFile(
      path.join(content, 'index.md'),
      '# ' + site.title + '\n\n[中文](zh/) · [English](en/)\n',
    );
    const origin =
      process.env.DOCS_ORIGIN ??
      `https://${site.id === 'reactive-mp' ? 'reactive-mp' : 'reactive-mp-' + site.id}-docs.pages.jangts.cafe`;
    const themeFor = (locale) => {
      const en = locale === 'en';
      const link = (slug) => `/${locale}/${slug}.html`;
      return {
        nav: [
          { text: en ? 'Guide' : '指南', link: link('getting-started') },
          ...(site.id === 'components'
            ? [
                { text: en ? 'Components' : '组件', link: link('catalog') },
                { text: 'Hooks', link: link('hooks') },
              ]
            : []),
          { text: 'API', link: link('api') },
          { text: `v${site.version}`, link: link('index') },
        ],
        sidebar: site.groups.map((group) => ({
          text: en ? group.titleEn : group.title,
          items: group.pages.map(([slug, title, , englishTitle]) => ({
            text: en ? englishTitle : title,
            link: link(slug),
          })),
        })),
        outline: { level: [2, 3], label: en ? 'On this page' : '本页内容' },
        docFooter: {
          prev: en ? 'Previous' : '上一篇',
          next: en ? 'Next' : '下一篇',
        },
        returnToTopLabel: en ? 'Back to top' : '回到顶部',
        sidebarMenuLabel: en ? 'Menu' : '目录',
        darkModeSwitchLabel: en ? 'Toggle theme' : '切换主题',
        lightModeSwitchTitle: en ? 'Switch to light theme' : '切换到浅色主题',
        darkModeSwitchTitle: en ? 'Switch to dark theme' : '切换到深色主题',
        langMenuLabel: en ? 'Change language' : '切换语言',
        footer: {
          message: en ? site.descriptionEn : site.description,
          copyright: 'ISC © Reactive MP',
        },
      };
    };
    const config = {
      title: site.title,
      description: site.descriptionEn,
      lang: 'en',
      base,
      srcDir: 'content',
      outDir: directory,
      cleanUrls: false,
      head: [
        [
          'link',
          {
            rel: 'icon',
            type: 'image/svg+xml',
            href: base + 'branding/' + path.basename(site.branding.icon),
          },
        ],
      ],
      markdown: {
        lineNumbers: true,
        theme: { light: 'github-light', dark: 'github-dark' },
      },
      locales: Object.fromEntries(
        locales.map((locale) => [
          locale,
          {
            label: locale === 'zh' ? '简体中文' : 'English',
            lang: locale === 'zh' ? 'zh-CN' : 'en',
            description:
              locale === 'zh' ? site.description : site.descriptionEn,
            themeConfig: themeFor(locale),
          },
        ]),
      ),
      themeConfig: {
        logo: '/branding/' + path.basename(site.branding.icon),
        siteTitle: site.title,
        ...themeFor('en'),
        search: {
          provider: 'local',
          options: {
            locales: {
              zh: {
                translations: {
                  button: {
                    buttonText: '搜索文档',
                    buttonAriaLabel: '搜索文档',
                  },
                  modal: {
                    noResultsText: '没有找到相关结果',
                    resetButtonTitle: '清除搜索',
                    displayDetails: '显示详细结果',
                    footer: {
                      selectText: '选择',
                      navigateText: '切换',
                      closeText: '关闭',
                    },
                  },
                },
              },
            },
          },
        },
      },
      sitemap: { hostname: origin + base },
    };
    const transform = `transformHead({pageData}) { const p=pageData.relativePath.replace(/index\\.md$/, '').replace(/\\.md$/, '.html'); const route=p.replace(/^(zh|en)\\//,''); const current=/^(zh|en)\\//.test(p)?p:'en/';return [['link',{rel:'canonical',href:${JSON.stringify(origin + base)}+current}],...['zh','en'].map(l=>['link',{rel:'alternate',hreflang:l==='zh'?'zh-CN':l,href:${JSON.stringify(origin + base)}+l+'/'+route}]),['link',{rel:'alternate',hreflang:'x-default',href:${JSON.stringify(origin + base + 'en/')}+route}]];}`;
    const search = `config.themeConfig.search.options.miniSearch={options:{tokenize:text=>Array.from(new Intl.Segmenter('zh',{granularity:'word'}).segment(text),part=>part.segment.toLowerCase()).filter(term=>/[\\p{L}\\p{N}_]/u.test(term))},searchOptions:{prefix:true,fuzzy:0.15}};`;
    await writeFile(
      path.join(configRoot, 'config.mjs'),
      `const config=${JSON.stringify(config)};${search}export default {...config, ${transform}};`,
    );
    await vitepressBuild(stage);
    // 中性入口及历史扁平地址仅做语言路由；完整正文只在 /zh/ 与 /en/。
    for (const [slug] of sitePages(site)) {
      const route = slug === 'index' ? '' : slug + '.html';
      await writeFile(
        path.join(directory, slug + '.html'),
        `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${site.title}</title><script>${languageEntry(route)}</script><a href="./zh/${route}">中文</a> · <a href="./en/${route}">English</a></html>`,
      );
    }
    await writeFile(
      path.join(directory, 'site-manifest.json'),
      JSON.stringify(
        {
          base,
          package: site.packageName,
          version: site.version,
          locales,
          pages: sitePages(site).map(([slug]) => slug),
        },
        null,
        2,
      ),
    );
    await verifyPublicSite(directory);
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}
