/** 检查文档导航、链接、引用和 API 来源的一致性。 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { navigation, sourceForPage } from '../apps/docs/navigation.mjs';
import { reference } from './api-reference.mjs';
import {
  workspacePackages,
  root,
  isInside,
  readSource,
} from './lib/workspace.mjs';
const expected = await reference();
if ((await readFile('docs/api.md', 'utf8')) !== expected) {
  throw Error('API reference is stale; run npm run docs:api');
}
const files = [
  'README.md',
  'docs/README.md',
  'apps/docs/README.md',
  ...navigation.map(([slug]) => sourceForPage(slug)),
  ...(await workspacePackages()).map(
    (pkg) => `packages/${pkg.folder}/README.md`,
  ),
];
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
      !isInside(path.resolve(root, path.dirname(file)), target)
    ) {
      throw Error(`${file}: package link is outside delivered package`);
    }
  }
  for (const match of text.matchAll(/^<<< (.+)$/gm)) {
    await readSource(match[1].trim());
  }
}
console.log(
  'Documentation navigation, links, source includes and API contracts verified',
);
