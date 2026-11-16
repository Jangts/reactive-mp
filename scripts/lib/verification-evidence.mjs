/** 平台回执基线：对实际源码和宿主配置计算摘要，避免历史结果误用于新实现。 */
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function sourceDigest(root, directories) {
  const hash = createHash('sha256');
  async function visit(directory) {
    const entries = await readdir(path.join(root, directory), {
      withFileTypes: true,
    });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (
        ['vendor', 'node_modules'].includes(entry.name) ||
        entry.name.startsWith('.') ||
        entry.name === 'project.private.config.json'
      ) {
        continue;
      }
      const relative = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(relative);
      } else if (entry.isFile()) {
        hash
          .update(relative)
          .update('\0')
          .update(await readFile(path.join(root, relative)))
          .update('\0');
      }
    }
  }
  for (const directory of directories) {
    await visit(directory);
  }
  return hash.digest('hex');
}
