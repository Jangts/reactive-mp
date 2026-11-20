/** 检查文档导航、链接、引用和 API 来源的一致性。 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import {
  documentationSites,
  documentationPackages,
  sitePages,
} from '../apps/docs/navigation.mjs';
import { localizedSource } from '../apps/docs/public-site.mjs';
import { expand } from '../apps/docs/render.mjs';
import { componentDocuments, componentCatalog } from './component-docs.mjs';
import { references } from './api-reference.mjs';
import { workspacePackages, root, isInside } from './lib/workspace.mjs';
for (const [file, expected] of await references()) {
  if ((await readFile(file, 'utf8')) !== expected) {
    throw Error(`${file}: API reference is stale; run npm run docs:api`);
  }
}
const sites = await documentationSites();
const componentRoutes = new Set(
  sitePages(sites.find((site) => site.id === 'components')).map(
    ([slug]) => slug,
  ),
);
for (const item of componentCatalog) {
  if (!componentRoutes.has(item.slug)) {
    throw Error(
      `${item.slug}: component reference must appear in site navigation`,
    );
  }
}
for (const pkg of await documentationPackages()) {
  if (
    !pkg.descriptionEn ||
    pkg.groups.some(
      (group) => !group.titleEn || group.pages.some((page) => !page[3]),
    )
  ) {
    throw Error(
      `${pkg.packageName}: bilingual descriptions and navigation are required`,
    );
  }
}
for (const [file, expected] of await componentDocuments()) {
  if ((await readFile(file, 'utf8')) !== expected) {
    throw Error(
      `${file}: component reference is stale; run npm run docs:components`,
    );
  }
}
const files = new Set([
  'README.md',
  'docs/README.md',
  'apps/docs/README.md',
  ...sites.flatMap((site) => sitePages(site).map(([, , source]) => source)),
  ...sites
    .filter((site) => site.packageName)
    .flatMap((site) =>
      sitePages(site).map(([, , source]) => localizedSource(source, 'en')),
    ),
  ...sites.flatMap((site) => Object.values(site.branding)),
  ...(await workspacePackages()).map(
    (pkg) => `packages/${pkg.folder}/README.md`,
  ),
]);
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const links = [
    ...text.matchAll(/\]\(([^)]+)\)/g),
    ...text.matchAll(/<img[^>]+src="([^"]+)"/g),
  ];
  for (const match of links) {
    const link = match[1].split('#')[0];
    if (!link || /^[a-z]+:/.test(link)) {
      continue;
    }
    const target = path.resolve(root, path.dirname(file), link);
    if (!isInside(root, target)) {
      throw Error(`${file}: link escapes workspace`);
    }
    await access(target);
    if (
      file.startsWith('packages/') &&
      !isInside(path.resolve(root, ...file.split('/').slice(0, 2)), target)
    ) {
      throw Error(`${file}: package link is outside delivered package`);
    }
  }
  await expand(text);
}
console.log(
  'Documentation navigation, links, source includes and API contracts verified',
);
