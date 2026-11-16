#!/usr/bin/env node
/** 将安装的 Reactive MP 包接入原生工程；只复制 ESM 源码并解析公开导入路径。 */
import {
  mkdir,
  readFile,
  readdir,
  realpath,
  lstat,
  writeFile,
  rm,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** 枚举安装包中的实际源码；拒绝符号链接避免携带包外内容。 */
async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw Error('package source must not contain symlinks');
    }
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(file)));
    } else if (/\.(?:js|json|wxml|wxss|wxs)$/.test(entry.name)) {
      files.push(file);
    }
  }
  return files;
}

/** 读取 facade 的完整依赖闭包；不依赖某个 workspace 的绝对路径。 */
async function installedPackages(name = 'reactive-mp', packages = new Map()) {
  if (packages.has(name)) {
    return packages;
  }
  const entry = fileURLToPath(import.meta.resolve(name));
  const root = path.dirname(path.dirname(entry));
  const manifest = JSON.parse(
    await readFile(path.join(root, 'package.json'), 'utf8'),
  );
  packages.set(name, { manifest, root, folder: name.split('/').at(-1) });
  for (const dependency of Object.keys(manifest.dependencies ?? {})) {
    await installedPackages(dependency, packages);
  }
  return packages;
}

/** 只解析包声明的默认 ESM 导出，不猜测未公开的源码路径。 */
export function resolveNativeExport(manifest, suffix) {
  let entry = manifest.exports[suffix ? `.${suffix}` : '.'];
  if (!entry && suffix && manifest.exports['./*']) {
    entry = manifest.exports['./*'].replace('*', suffix.slice(1));
  }
  if (typeof entry === 'object') {
    entry = entry.default;
  }
  if (typeof entry !== 'string' || !/^\.\/(?:src|miniprogram)\//.test(entry)) {
    throw Error(`unresolved native export: ${manifest.name}${suffix}`);
  }
  return entry;
}

/**
 * 准备源码到调用方拥有的目录，不清理未知文件。
 * @param {string} output 原生工程中的 vendor 目录。
 * @param {Map} packages 可选的工作区包描述；缺省使用已安装的依赖闭包。
 * @returns {Promise<void>} 所有导入改写并写入完成。
 */
export async function prepareNativeSources(output, packages) {
  packages ??= await installedPackages();
  const directory = path.resolve(output);
  let current = path.parse(directory).root;
  for (const part of directory
    .slice(current.length)
    .split(path.sep)
    .filter(Boolean)) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw Error('native output must not contain symlinks');
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  await mkdir(directory, { recursive: true });
  const realOutput = await realpath(directory);
  for (const pkg of packages.values()) {
    if (realOutput === pkg.root || realOutput.startsWith(pkg.root + path.sep)) {
      throw Error('output must not overwrite an installed package');
    }
  }
  const known = new Set([...packages.values()].map((pkg) => pkg.folder));
  const existing = await readdir(directory);
  if (existing.length && !existing.includes('.reactive-mp-generated')) {
    throw Error('native output is not owned by this tool');
  }
  await sourceFiles(directory);
  if (
    existing.some(
      (name) => !known.has(name) && name !== '.reactive-mp-generated',
    )
  ) {
    throw Error('native output contains unowned files');
  }
  for (const pkg of packages.values()) {
    await rm(path.join(directory, pkg.folder), {
      recursive: true,
      force: true,
    });
    const sourceFolder = pkg.manifest.miniprogram || 'src';
    const source = path.join(pkg.root, sourceFolder);
    for (const file of await sourceFiles(source)) {
      const destination = path.join(
        directory,
        pkg.folder,
        sourceFolder,
        path.relative(source, file),
      );
      let text = await readFile(file, 'utf8');
      text = text.replace(
        /(from\s+['"])(@reactive-mp\/[\w-]+)([^'"]*)(['"])/g,
        (_, prefix, name, suffix, quote) => {
          const targetPackage = packages.get(name);
          if (!targetPackage) {
            throw Error(`missing native dependency: ${name}`);
          }
          const target = path.join(
            directory,
            targetPackage.folder,
            resolveNativeExport(targetPackage.manifest, suffix),
          );
          let relative = path
            .relative(path.dirname(destination), target)
            .split(path.sep)
            .join('/');
          if (!relative.startsWith('.')) {
            relative = './' + relative;
          }
          return prefix + relative + quote;
        },
      );
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, text);
    }
  }
  await writeFile(
    path.join(directory, '.reactive-mp-generated'),
    'Generated Reactive MP native sources\n',
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const index = process.argv.indexOf('--out');
  if (index < 0 || !process.argv[index + 1]) {
    throw Error('usage: reactive-mp-prepare --out <project/vendor>');
  }
  await prepareNativeSources(process.argv[index + 1]);
  console.log(
    'Prepared native sources in ' + path.resolve(process.argv[index + 1]),
  );
}
