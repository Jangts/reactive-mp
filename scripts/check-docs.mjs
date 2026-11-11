import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { navigation } from '../apps/docs/navigation.mjs';
import { reference } from './api-reference.mjs';
const expected = await reference();
if (await readFile('docs/api.md', 'utf8') !== expected) throw Error('API reference is stale; run npm run docs:api');
for (const [slug] of navigation) {
  const file = `docs/${slug}.md`;
  const text = await readFile(file, 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1].split('#')[0];
    if (!link || /^[a-z]+:/.test(link)) continue;
    await access(path.resolve(path.dirname(file), link));
  }
  for (const match of text.matchAll(/^<<< (.+)$/gm)) await access(match[1].trim());
}
console.log('Documentation navigation, links, source includes and API contracts verified');
