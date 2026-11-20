/** 文档渲染边界：转义原始 HTML，拒绝可执行 URL，使用受限源码引用。 */
import { Marked } from 'marked';
import { readSource } from '../../scripts/lib/workspace.mjs';

/** 为文本和属性上下文编码，源码不得被解释为 HTML。 */
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** 只保留站内相对链接及 HTTP(S)，拒绝脚本、data 与其他可执行协议。 */
function safeUrl(href) {
  const value = String(href ?? '');
  try {
    const parsed = new URL(value, 'https://docs.invalid/');
    return ['http:', 'https:'].includes(parsed.protocol)
      ? escapeHtml(value)
      : '#';
  } catch {
    return '#';
  }
}

const parser = new Marked({
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, tokens }) {
      return `<a href="${safeUrl(href)}">${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, text }) {
      return `<img src="${safeUrl(href)}" alt="${escapeHtml(text)}">`;
    },
  },
});

/** 从当前仓库的允许目录引用源码；包含 ``` 的源码仍作为一个完整代码块显示。 */
export async function expand(source) {
  return (
    await Promise.all(
      source.split('\n').map(async (line) => {
        if (!line.startsWith('<<< ')) {
          return line;
        }
        const [, file, label] = /^(.*?)(?: \[([^\]]+)\])?$/.exec(
          line.slice(4).trim(),
        );
        const code = await readSource(file);
        const runs = [...code.matchAll(/`+/g)].map((match) => match[0].length);
        const fence = '`'.repeat(
          Math.max(3, ...runs.map((length) => length + 1)),
        );
        const language = file.endsWith('.wxml')
          ? 'xml'
          : file.endsWith('.json')
            ? 'json'
            : file.endsWith('.wxss')
              ? 'css'
              : file.endsWith('.ts')
                ? 'ts'
                : 'js';
        return `${fence}${language}${label ? ` [${label}]` : ''}\n${code.trim()}\n${fence}`;
      }),
    )
  ).join('\n');
}

/** 渲染可信正文的 Markdown 结构，同时禁用正文中的原始 HTML 执行。 */
export function renderMarkdown(source) {
  const markdown = source.replace(
    /^::: code-group\n([\s\S]*?)^:::[ \t]*$/gm,
    (_, blocks) =>
      blocks.replace(/^(`{3,}js) \[([^\]\n]+)\]/gm, '**$2**\n\n$1'),
  );
  return parser.parse(markdown);
}
