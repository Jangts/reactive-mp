/** 根据实际包导出和模块类型生成 API 参考，拒绝声明与实现漂移。 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';
import path from 'node:path';
import { workspacePackages } from './lib/workspace.mjs';

export async function references() {
  const packages = await workspacePackages();
  const entries = [];
  for (const pkg of packages) {
    const manifest = JSON.parse(
      await readFile(`packages/${pkg.folder}/package.json`, 'utf8'),
    );
    for (const [subpath, target] of Object.entries(manifest.exports)) {
      if (!target.types) {
        continue;
      }
      entries.push({
        name: manifest.name + (subpath === '.' ? '' : subpath.slice(1)),
        folder: pkg.folder,
        types: target.types.slice(2),
        source: (target.default ?? target.node).slice(2),
        packageName: manifest.name,
      });
    }
  }
  const files = entries.map(
    (entry) => `packages/${entry.folder}/${entry.types}`,
  );
  const program = ts.createProgram(files, {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
  });
  const checker = program.getTypeChecker();
  const blocks = [];
  for (let i = 0; i < entries.length; i++) {
    const { name } = entries[i];
    const runtime = await import(name);
    const file = program.getSourceFile(files[i]);
    const symbols = checker.getExportsOfModule(
      checker.getSymbolAtLocation(file),
    );
    const declarations = new Map(
      symbols.map((symbol) => [symbol.name, symbol]),
    );
    let markdown = '| API | 类型签名 |\n| --- | --- |\n';
    for (const exportName of Object.keys(runtime).sort()) {
      const symbol = declarations.get(exportName);
      if (!symbol) {
        throw Error(`${name}: exported ${exportName} has no declaration`);
      }
      const type = checker.getTypeOfSymbolAtLocation(symbol, file);
      const signature = checker
        .typeToString(type, file, ts.TypeFormatFlags.NoTruncation)
        .replaceAll('|', '\\|')
        .replaceAll('`', '');
      markdown += `| ${exportName} | \`${signature}\` |\n`;
    }
    const declaredValues = symbols
      .filter((s) => {
        const resolved =
          s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
        return !!(resolved.flags & ts.SymbolFlags.Value);
      })
      .map((s) => s.name);
    for (const exportName of declaredValues)
      if (!(exportName in runtime)) {
        throw Error(`${name}: declared ${exportName} is not exported`);
      }
    markdown += '\n';
    blocks.push({ ...entries[i], markdown });
  }
  const documents = new Map([['docs/api.md', blocks]]);
  for (const pkg of packages) {
    if (pkg.manifest.reactiveMp?.release.type === 'public') {
      documents.set(
        `packages/${pkg.folder}/docs/api.md`,
        blocks.filter((block) => block.packageName === pkg.manifest.name),
      );
      documents.set(
        `packages/${pkg.folder}/docs/en/api.md`,
        blocks.filter((block) => block.packageName === pkg.manifest.name),
      );
    }
  }
  return new Map(
    [...documents].map(([file, selected]) => {
      const english = file.includes('/en/');
      const body = selected
        .map(({ name, folder, types, source, markdown }) => {
          const link = (target) =>
            path.posix.relative(
              path.posix.dirname(file),
              `packages/${folder}/${target}`,
            );
          return `## ${name}\n\n[${english ? 'Types and complete signatures' : '类型及完整签名'}](${link(types)}) · [${english ? 'Implementation' : '实现入口'}](${link(source)})\n\n${english ? markdown.replace('类型签名', 'Type signature') : markdown}`;
        })
        .join('');
      return [
        file,
        (english
          ? '# API reference\n\nPublic exports and their actual type signatures. Refer to the guides for parameters, defaults, lifecycle, and native bindings.\n\n'
          : '# API 参考\n\n公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。\n\n') +
          body,
      ];
    }),
  );
}
if (process.argv.includes('--write')) {
  for (const [file, markdown] of await references()) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, markdown);
  }
  console.log(
    'Updated workspace and public package API references from exports and declarations',
  );
}
