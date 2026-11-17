/** 文档站页面外壳：共享导航、目录、阅读顺序和可访问控件。 */
import { escapeHtml as escape } from './render.mjs';

/** 为同一读者组生成导航与前后篇，维护资料不混入使用导航。 */
export function renderPage({ site, slug, title, body, sections }) {
  const icon = escape(site.branding.icon.split('/').at(-1));
  const audience = site.groups.find((group) =>
    group.pages.some(([name]) => name === slug),
  ).audience;
  const groups = site.groups.filter((group) => group.audience === audience);
  const pages = groups.flatMap((group) => group.pages);
  const index = pages.findIndex(([name]) => name === slug);
  const nav = groups
    .map(
      (group) =>
        `<section><h2>${escape(group.title)}</h2>${group.pages.map(([name, label]) => `<a href="${name}.html"${name === slug ? ' aria-current="page"' : ''}>${escape(label)}</a>`).join('')}</section>`,
    )
    .join('');
  const pager = [
    [pages[index - 1], '上一篇'],
    [pages[index + 1], '下一篇'],
  ]
    .map(([page, label]) =>
      page
        ? `<a href="${page[0]}.html"><small>${label}</small>${escape(page[1])}</a>`
        : '<span></span>',
    )
    .join('');
  const other =
    site.id !== 'workspace'
      ? ''
      : audience === 'reader'
        ? '<a href="architecture.html">维护者入口 ↗</a>'
        : '<a href="index.html">使用文档 ↗</a>';
  const toc = sections.length
    ? `<aside class="toc" aria-label="本页目录"><p>本页内容</p>${sections.map(({ id, label }) => `<a href="#${id}">${escape(label)}</a>`).join('')}</aside>`
    : '';
  const version = site.version
    ? `<small class="version">v${escape(site.version)}</small>`
    : '';
  const packageSites =
    slug === 'index' && site.packages
      ? `<section class="package-sites" aria-label="独立文档站">${site.packages.map((pkg) => `<a href="${pkg.id}/index.html"><strong>${escape(pkg.title)} <small>v${escape(pkg.version)}</small></strong><span>${escape(pkg.description)}</span></a>`).join('')}</section>`
      : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="description" content="${escape(site.description)}"><title>${escape(title)} · ${escape(site.title)}</title><link rel="icon" type="image/svg+xml" href="assets/${icon}"><link rel="stylesheet" href="assets/styles.css"><script>try{const t=localStorage.getItem('reactive-mp-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}</script><script type="module" src="assets/client.js"></script></head><body>
<a class="skip" href="#content">跳到正文</a>
<header class="header"><a class="brand" href="index.html"><img src="assets/${icon}" width="32" height="32" alt=""><span>${escape(site.title)}</span>${version}</a><div class="header-actions"><button id="search-open" type="button">搜索文档 <kbd>⌘ K</kbd></button><button id="theme-toggle" type="button" aria-label="切换明暗主题">主题</button><button id="menu-toggle" type="button" aria-controls="sidebar" aria-expanded="false">目录</button></div></header>
<aside class="sidebar" id="sidebar" aria-label="文档导航"><nav>${nav}<div class="audience-link">${other}</div></nav></aside>
<div class="reading-layout"><main id="content" class="${slug === 'index' ? 'home' : ''}" tabindex="-1">${slug === 'index' ? `<div class="home-mark"><img src="assets/${icon}" width="150" height="150" alt=""><p>${escape(site.title.toLocaleUpperCase())}</p></div>` : ''}<article>${body}</article>${packageSites}<nav class="pager" aria-label="阅读顺序">${pager}</nav><footer>${escape(site.packageName ?? site.title)}${site.version ? ` · v${escape(site.version)}` : ''} · ${escape(site.description)}</footer></main>${toc}</div>
<dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><label id="search-title" for="search-input">搜索文档</label><button id="search-close" type="button" aria-label="关闭搜索">关闭</button></div><input id="search-input" type="search" placeholder="搜索文档…" autocomplete="off"><p id="search-status" role="status">输入关键词搜索站内文档</p><ul id="search-results"></ul></dialog></body></html>`;
}
