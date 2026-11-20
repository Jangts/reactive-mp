/** 从逐组件内容目录、真实属性定义和可运行原生示例生成双语组件参考。 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { expand } from '../apps/docs/render.mjs';
import {
  fieldProperties,
  formProperties,
  itemProperties,
  optionProperties,
} from '../packages/components/miniprogram/form/utils/properties.js';
import { properties as videoProperties } from '../packages/components/miniprogram/video/utils/properties.js';
import { swiperProperties } from '../packages/components/miniprogram/swiper/utils/properties.js';
const base = 'packages/components/docs';
export const componentCatalog = JSON.parse(
  await readFile(`${base}/components.json`, 'utf8'),
);
/** 只读取声明中的字面量和原生属性构造器，不执行组件注册。 */
function literal(node) {
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((p) => [p.name.text, literal(p.initializer)]),
    );
  }
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(literal);
  }
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  }
  if (ts.isPrefixUnaryExpression(node)) {
    return -literal(node.operand);
  }
  return {
    String,
    Number,
    Boolean,
    Array,
    Object,
    null: null,
    true: true,
    false: false,
  }[node.getText()];
}
async function componentProperties(item) {
  const file = `packages/components/miniprogram/${item.domain}/components/${item.folder}/index.js`;
  const source = await readFile(file, 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  let extra = {};
  function visit(node) {
    if (ts.isCallExpression(node)) {
      const name = node.expression.getText(ast);
      const argument =
        name === 'registerFieldComponent'
          ? node.arguments[1]
          : name === 'defineProps'
            ? node.arguments[0]
            : undefined;
      if (argument && ts.isObjectLiteralExpression(argument)) {
        extra = literal(argument);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  const options = [
    'radio-group',
    'checkbox-group',
    'select',
    'column-picker',
    'cascader',
  ].includes(item.slug)
    ? optionProperties
    : {};
  const shared =
    item.slug === 'form'
      ? formProperties
      : item.slug === 'form-item'
        ? itemProperties
        : item.slug === 'video'
          ? videoProperties
          : ['swiper', 'media-swiper'].includes(item.slug)
            ? swiperProperties
            : item.domain === 'form' && item.slug !== 'form-button'
              ? { ...fieldProperties, ...options }
              : {};
  return { ...shared, ...extra };
}
const descriptions = JSON.parse(
  await readFile(`${base}/property-descriptions.json`, 'utf8'),
);
function propertyTable(properties, locale, item) {
  if (!Object.keys(properties).length) {
    return locale === 'en'
      ? 'This wrapper declares no additional properties.\n'
      : '此 wrapper 不声明额外属性。\n';
  }
  const en = locale === 'en';
  const rows = Object.entries(properties).map(([name, raw]) => {
    const definition = typeof raw === 'function' ? { type: raw } : raw;
    const type = definition.type?.name?.toLowerCase() ?? 'unknown';
    const value =
      'value' in definition
        ? definition.value
        : type === 'boolean'
          ? false
          : type === 'string'
            ? ''
            : type === 'number'
              ? 0
              : type === 'array'
                ? []
                : null;
    const description =
      item.propertyDescriptions?.[name]?.[locale] ??
      descriptions[name]?.[locale];
    if (!description) {
      throw Error(`Missing ${locale} property description: ${name}`);
    }
    return `| ${name} | \`${type}\` | \`${JSON.stringify(value)}\` | ${description} |`;
  });
  return `| ${en ? 'Property | Type | Default | Description' : '属性 | 类型 | 默认值 | 说明'} |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n`;
}
/** 完整示例由随包文件提供，双语共用 JSON、WXML 和两种页面脚本。 */
export async function componentDocuments() {
  const documents = new Map();
  const wrappers = [];
  for (const domain of await readdir('packages/components/miniprogram', {
    withFileTypes: true,
  })) {
    if (!domain.isDirectory()) {
      continue;
    }
    try {
      for (const item of await readdir(
        `packages/components/miniprogram/${domain.name}/components`,
        { withFileTypes: true },
      )) {
        if (item.isDirectory()) {
          wrappers.push(`${domain.name}/${item.name}`);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  const declared = componentCatalog
    .map((item) => `${item.domain}/${item.folder}`)
    .sort();
  if (JSON.stringify(wrappers.sort()) !== JSON.stringify(declared)) {
    throw Error(
      'Every native wrapper must have exactly one component reference',
    );
  }
  for (const item of componentCatalog) {
    for (const locale of ['zh', 'en']) {
      if (
        ['description', 'when', 'content', 'faq', 'expected'].some(
          (key) => !item[key]?.[locale],
        )
      ) {
        throw Error(`${item.slug}: missing ${locale} component content`);
      }
    }
    const properties = await componentProperties(item);
    const componentPath = `packages/components/miniprogram/${item.domain}/components/${item.folder}/index`;
    const template = await readFile(componentPath + '.wxml', 'utf8');
    const slots = [
      ...new Set(
        [...template.matchAll(/<slot(?:\s+name="([^"]+)")?\s*\/?\s*>/g)].map(
          (m) => m[1] ?? 'default',
        ),
      ),
    ];
    for (const locale of ['zh', 'en']) {
      const en = locale === 'en';
      const dir = en ? 'en/' : '';
      const demo = `${base}/examples/${item.slug}`;
      const content = item.content[locale];
      const [exampleJson, exampleWxml, nativeJs, reactiveJs] =
        await Promise.all(
          ['index.json', 'index.wxml', 'index.js', 'index.reactive.js'].map(
            (file) => expand(`<<< ${demo}/${file}`),
          ),
        );
      const exampleJs = [
        '::: code-group',
        nativeJs.replace(
          'js\n',
          en ? 'js [Native configuration]\n' : 'js [原生配置式]\n',
        ),
        reactiveJs.replace(
          'js\n',
          en ? 'js [Reactive composition]\n' : 'js [组合响应式]\n',
        ),
        ':::',
      ].join('\n\n');
      const table = propertyTable(properties, locale, item);
      const events = item.events
        .map(([name, zh, english]) => `| ${name} | ${en ? english : zh} |`)
        .join('\n');
      const methods = item.methods
        .map(([name, zh, english]) => `| \`${name}\` | ${en ? english : zh} |`)
        .join('\n');
      const body = `# ${en ? item.name : item.title}\n\n${item.description[locale]}\n\n## ${en ? 'When to use' : '何时使用'}\n\n${item.when[locale]}\n\n## ${en ? 'Basic example' : '基础用法'}\n\n${en ? 'Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.' : '以下为原生小程序页面的完整文件。先按[快速上手](getting-started.md)准备 vendor，在 app.json 注册页面，并提供示例引用的媒体资源。'}\n\n### index.json\n\n${exampleJson}\n\n### index.wxml\n\n${exampleWxml}\n\n### index.js\n\n${en ? 'Use either script as index.js. Both use the same JSON and WXML above.' : '任选一种脚本保存为 index.js，两种写法共用上面的 JSON 和 WXML。'}\n\n${exampleJs}\n\n${item.expected[locale]}\n\n## ${en ? 'Usage patterns' : '常用场景'}\n\n${content}\n\n## ${en ? 'Properties' : '属性'}\n\n${table}\n${item.domain === 'form' && !['form', 'form-item', 'form-button'].includes(item.slug) ? (en ? 'A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).\n' : '连接 Form 的字段从表单模型读取值；value/defaultValue 用于独立字段。readonly 字段仍参与校验，disabled 或 inactive 字段退出校验。见[模型与校验](form-guide.md)。\n') : ''}\n## ${en ? 'Events' : '事件'}\n\n${events ? `| ${en ? 'Event | event.detail' : '事件 | event.detail'} |\n| --- | --- |\n${events}` : en ? 'No additional custom events are declared by this wrapper.' : '此 wrapper 不额外声明自定义事件。'}\n\n## ${en ? 'Slots and styling' : '插槽与样式'}\n\n${slots.length ? (en ? 'Available slots: ' : '可用插槽：') + slots.map((name) => '\`' + name + '\`').join(', ') + (en ? '.' : '。') : en ? 'This wrapper has no content slots.' : '此 wrapper 不提供内容插槽。'} ${en ? 'See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.' : '实际 CSS 变量、外部样式类和布局职责见[样式与插槽](styling.md)。'}\n\n## ${en ? 'Instance methods' : '实例方法'}\n\n${methods ? (en ? 'Obtain the native instance with this.selectComponent(selector) after onReady.\n\n| Method | Contract |\n| --- | --- |\n' : '在 onReady 后通过 this.selectComponent(selector) 取得原生实例。\n\n| 方法 | 合同 |\n| --- | --- |\n') + methods : en ? 'No additional imperative methods are documented for this wrapper.' : '此 wrapper 不额外约定命令式实例方法。'}\n\n## ${en ? 'FAQ and boundaries' : '常见问题与边界'}\n\n${item.faq[locale]}\n\n[${en ? 'Headless hooks and controllers' : '无头 Hooks 与控制器'}](hooks.md) · [${en ? 'Complete type signatures' : '完整类型签名'}](api.md)\n`;
      documents.set(`${base}/${dir}${item.slug}.md`, body);
    }
  }
  return documents;
}
if (process.argv.includes('--write')) {
  for (const [file, text] of await componentDocuments()) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  }
  console.log(
    `Generated ${componentCatalog.length} component references in Chinese and English`,
  );
}
