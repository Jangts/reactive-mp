/** 文档页面与读者分组的唯一清单，供构建和检查共同消费。 */
// One source owns page generation and the reader/maintainer navigation boundary.
export const navigationGroups = [
  {
    title: '使用文档',
    audience: 'reader',
    pages: [
      ['index', '概览'],
      ['getting-started', '快速上手'],
      ['guide', '响应式与组合逻辑'],
      ['native-options', '原生配置与动态声明'],
      ['store', '共享状态'],
      ['api', 'API 参考'],
      ['setup-runtime', '运行原理'],
    ],
  },
  {
    title: '维护规范',
    audience: 'maintainer',
    pages: [
      ['architecture', '架构与贡献'],
      ['documentation-index', '文档索引', 'docs/README.md'],
      ['documentation-site', '文档站维护', 'apps/docs/README.md'],
      ['documentation-standard', '文档规范'],
      ['code-standard', '代码规范'],
      ['code-review-standard', '代码检查与验收标准'],
      ['validation', '开发宿主与验证'],
    ],
  },
  {
    title: '计划与记录',
    audience: 'maintainer',
    pages: [
      ['development-plan', '重构计划'],
      ['platform-coverage', '平台能力清单与计划'],
      ['verification', '验证记录'],
      ['standards-review', '规范检查记录'],
    ],
  },
];
export const navigation = navigationGroups.flatMap((group) => group.pages);

/** 来源与站点路由共用同一登记；README 不按 basename 猜测路由。 */
export function sourceForPage(slug) {
  const page = navigation.find(([name]) => name === slug);
  if (!page) {
    throw Error(`Unknown documentation page: ${slug}`);
  }
  return page[2] ?? `docs/${slug}.md`;
}
