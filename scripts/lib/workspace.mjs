/** 工作区工具的根路径、包与宿主清单；不进入小程序依赖图。 */
import { readdir, readFile, realpath, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));

/** 从 workspace 的实际包清单读取名称和导出，避免工具各自维护包列表。 */
export async function workspacePackages() {
  const entries = await readdir(path.join(root, 'packages'), {
    withFileTypes: true,
  });
  return Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const manifest = JSON.parse(
          await readFile(
            path.join(root, 'packages', entry.name, 'package.json'),
            'utf8',
          ),
        );
        return { folder: entry.name, manifest };
      }),
  );
}

/** 宿主以自身 project.config.json 注册，不在多个工具中维护平行列表。 */
export async function workspaceHosts() {
  const entries = await readdir(path.join(root, 'examples'), {
    withFileTypes: true,
  });
  const hosts = [];
  for (const entry of entries)
    if (entry.isDirectory()) {
      try {
        await lstat(
          path.join(root, 'examples', entry.name, 'project.config.json'),
        );
        hosts.push(entry.name);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  return hosts;
}

/** 判断规范化路径是否仍在给定目录中；不能以字符串前缀代替目录边界。 */
export function isInside(parent, file) {
  const relative = path.relative(parent, file);
  return (
    relative === '' ||
    (!relative.startsWith('..' + path.sep) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  );
}

/** 读取可公开源码。规范化和符号链接解析后都必须留在允许的工作区目录。 */
export async function readSource(
  relative,
  allowed = ['packages', 'examples', 'tests', 'scripts'],
) {
  if (path.isAbsolute(relative)) {
    throw Error('source path must be relative');
  }
  const file = path.resolve(root, relative);
  if (!allowed.some((folder) => isInside(path.join(root, folder), file))) {
    throw Error('source path is outside allowed directories');
  }
  const resolved = await realpath(file);
  const realRoot = await realpath(root);
  if (
    !allowed.some((folder) => isInside(path.join(realRoot, folder), resolved))
  ) {
    throw Error('source symlink escapes allowed directories');
  }
  return readFile(resolved, 'utf8');
}

/** 删除、写入生成目录前拒绝任一路径组件上的符号链接。 */
export async function assertOwnedPath(relative) {
  const file = path.resolve(root, relative);
  if (!isInside(root, file) || file === path.resolve(root)) {
    throw Error('invalid generated path');
  }
  let current = root;
  for (const part of path.relative(root, file).split(path.sep)) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw Error('generated path contains a symlink');
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return file;
}
