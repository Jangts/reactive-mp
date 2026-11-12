/** 检查文档导航、链接、引用和 API 来源的一致性。 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { navigation } from '../apps/docs/navigation.mjs';
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
  ...navigation.map(([slug]) => `docs/${slug}.md`),
  ...(await workspacePackages()).map(
    (pkg) => `packages/${pkg.folder}/README.md`,
  ),
];
for (const file of files) {
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
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
