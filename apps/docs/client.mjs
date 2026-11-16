/** 纯静态文档交互：本地全文检索、持久主题与移动导航，不发送搜索内容。 */
const themeButton = document.querySelector('#theme-toggle');
const darkPreference = matchMedia('(prefers-color-scheme: dark)');
const isDark = () =>
  document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : darkPreference.matches;
function updateThemeLabel() {
  themeButton.setAttribute(
    'aria-label',
    isDark() ? '切换到浅色主题' : '切换到深色主题',
  );
}
updateThemeLabel();
darkPreference.addEventListener('change', updateThemeLabel);
themeButton.addEventListener('click', () => {
  const theme = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('reactive-mp-theme', theme);
  } catch {
    /* 隐私模式下保留本页主题。 */
  }
  updateThemeLabel();
});
const menu = document.querySelector('#menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});
const dialog = document.querySelector('#search-dialog');
const input = document.querySelector('#search-input');
const results = document.querySelector('#search-results');
const status = document.querySelector('#search-status');
let indexPromise;
let searchRevision = 0;
function openSearch() {
  dialog.showModal();
  input.focus();
}
document.querySelector('#search-open').addEventListener('click', openSearch);
document
  .querySelector('#search-close')
  .addEventListener('click', () => dialog.close());
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!dialog.open) {
      openSearch();
    }
  }
});
/** 索引只在首次搜索时读取；文本通过 DOM 属性插入，正文不作为 HTML 执行。 */
async function search() {
  const revision = ++searchRevision;
  const query = input.value.trim().toLocaleLowerCase();
  results.replaceChildren();
  if (!query) {
    status.textContent = '输入关键词搜索全部文档';
    return;
  }
  status.textContent = '正在搜索…';
  try {
    indexPromise ??= fetch('assets/search-index.json')
      .then((response) => {
        if (!response.ok) {
          throw Error('搜索索引加载失败');
        }
        return response.json();
      })
      .catch((error) => {
        indexPromise = undefined;
        throw error;
      });
    const pages = await indexPromise;
    if (revision !== searchRevision) {
      return;
    }
    const terms = query.split(/\s+/u);
    const matches = pages
      .filter((page) =>
        terms.every((term) =>
          `${page.title} ${page.text}`.toLocaleLowerCase().includes(term),
        ),
      )
      .sort(
        (a, b) =>
          Number(b.title.toLocaleLowerCase().includes(query)) -
          Number(a.title.toLocaleLowerCase().includes(query)),
      )
      .slice(0, 20);
    status.textContent = matches.length
      ? `找到 ${matches.length} 篇文档`
      : '没有找到结果，试试更短的关键词';
    for (const page of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = page.href;
      const title = document.createElement('strong');
      title.textContent = `${page.title} · ${page.group}`;
      const excerpt = document.createElement('p');
      const at = Math.max(
        0,
        page.text.toLocaleLowerCase().indexOf(terms[0]) - 35,
      );
      excerpt.textContent = page.text.slice(at, at + 150);
      link.append(title, excerpt);
      item.append(link);
      results.append(item);
    }
  } catch {
    if (revision === searchRevision) {
      status.textContent = '搜索索引未能加载，请重新输入或使用左侧目录';
    }
  }
}
input.addEventListener('input', search);
