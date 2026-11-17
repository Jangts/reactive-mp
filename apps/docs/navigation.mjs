/** 从公开包的 docs 声明建立独立站点，同时保留工作区文档与维护入口。 */
import path from 'node:path';
import {
  workspacePackages,
  readSource,
  root,
  isInside,
} from '../../scripts/lib/workspace.mjs';

const sharedBranding = {
  icon: 'docs/assets/branding/reactive-mp-icon.svg',
  logo: 'docs/assets/branding/reactive-mp-logo.svg',
};

const maintenanceGroups = [
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
      ['api', '工作区 API'],
      ['internal-runtime', '内部运行时', 'packages/runtime/README.md'],
      ['internal-shared', '内部工具', 'packages/shared/README.md'],
    ],
  },
  {
    title: '计划与记录',
    audience: 'maintainer',
    pages: [
      ['form-design', '表单套件设计草案'],
      ['form-validation', '表单套件验证记录'],
      ['development-plan', '重构计划'],
      ['platform-coverage', '平台能力清单与计划'],
      ['verification', '验证记录'],
      ['standards-review', '规范检查记录'],
      ['images-preloader-extraction', '图片预加载组件抽取记录'],
      ['wechat-extraction', '微信 API 封装抽取记录'],
    ],
  },
];

/** 公开包必须提供自己的正文与导航；站点版本直接取该包版本。 */
export async function documentationSites(packages) {
  packages ??= await workspacePackages();
  const sites = [];
  for (const pkg of packages) {
    if (pkg.manifest.reactiveMp?.release.type !== 'public') {
      continue;
    }
    const directory = `packages/${pkg.folder}`;
    const declared = pkg.manifest.reactiveMp?.docs;
    if (typeof declared !== 'string') {
      throw Error(`${pkg.manifest.name}: declare reactiveMp.docs`);
    }
    const configPath = path.posix.normalize(
      path.posix.join(directory, declared),
    );
    if (
      !isInside(path.join(root, directory, 'docs'), path.join(root, configPath))
    ) {
      throw Error(
        `${pkg.manifest.name}: documentation must belong to its docs directory`,
      );
    }
    const config = JSON.parse(await readSource(configPath, [directory]));
    if (!config.title || !config.description || !config.groups?.length) {
      throw Error(
        `${pkg.manifest.name}: documentation needs a title, description and groups`,
      );
    }
    const branding = { ...sharedBranding };
    for (const kind of Object.keys(sharedBranding)) {
      const declaredAsset = config.branding?.[kind];
      if (declaredAsset === undefined) {
        continue;
      }
      if (
        typeof declaredAsset !== 'string' ||
        !/^[\w./-]+\.svg$/.test(declaredAsset)
      ) {
        throw Error(`${pkg.manifest.name}: invalid ${kind} SVG asset`);
      }
      const source = path.posix.normalize(
        path.posix.join(path.posix.dirname(configPath), declaredAsset),
      );
      if (
        !isInside(path.join(root, directory, 'docs'), path.join(root, source))
      ) {
        throw Error(
          `${pkg.manifest.name}: branding must belong to its docs directory`,
        );
      }
      branding[kind] = source;
    }
    const slugs = new Set();
    const groups = config.groups.map((group) => ({
      title: group.title,
      audience: 'reader',
      pages: group.pages.map(([slug, title]) => {
        if (!/^[a-z][a-z0-9-]*$/.test(slug) || slugs.has(slug) || !title) {
          throw Error(
            `${pkg.manifest.name}: invalid or duplicate documentation page ${slug}`,
          );
        }
        slugs.add(slug);
        return [slug, title, `${directory}/docs/${slug}.md`];
      }),
    }));
    for (const required of ['index', 'getting-started', 'guide', 'api']) {
      if (!slugs.has(required)) {
        throw Error(
          `${pkg.manifest.name}: missing documentation page ${required}`,
        );
      }
    }
    sites.push({
      id: pkg.folder,
      packageName: pkg.manifest.name,
      packageRoot: directory,
      title: config.title,
      description: config.description,
      version: pkg.manifest.version,
      branding,
      groups,
    });
  }
  const workspace = {
    id: 'workspace',
    title: 'Reactive MP',
    description: '公开包独立文档与工作区维护入口',
    branding: sharedBranding,
    groups: [
      {
        title: '文档入口',
        audience: 'reader',
        pages: [['index', '概览', 'docs/index.md']],
      },
      ...sites.map((site) => ({
        title: `${site.title} · ${site.version}`,
        audience: 'reader',
        pages: site.groups.flatMap((group) =>
          group.pages.map(([slug, title, source]) => [
            `${site.id}-${slug}`,
            title,
            source,
          ]),
        ),
      })),
      ...maintenanceGroups.map((group) => ({
        ...group,
        pages: group.pages.map(([slug, title, source]) => [
          slug,
          title,
          source ?? `docs/${slug}.md`,
        ]),
      })),
    ],
    packages: sites.map(({ id, title, version, description }) => ({
      id,
      title,
      version,
      description,
    })),
  };
  return [workspace, ...sites];
}

/** 一个站点中的全部路由与正文来源；构建、检查和搜索共同消费。 */
export function sitePages(site) {
  return site.groups.flatMap((group) => group.pages);
}
