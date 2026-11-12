/** 根据实际包导出和模块类型生成 API 参考，拒绝声明与实现漂移。 */
import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import { workspacePackages } from './lib/workspace.mjs';

export async function reference() {
  const entries = [];
  for (const pkg of await workspacePackages()) {
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
  let markdown =
    '# API 参考\n\n公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。\n\n';
  for (let i = 0; i < entries.length; i++) {
    const { name, folder, types, source } = entries[i];
    const runtime = await import(name);
    const file = program.getSourceFile(files[i]);
    const symbols = checker.getExportsOfModule(
      checker.getSymbolAtLocation(file),
    );
    const declarations = new Map(
      symbols.map((symbol) => [symbol.name, symbol]),
    );
    markdown += `## ${name}\n\n[类型及完整签名](../packages/${folder}/${types}) · [实现入口](../packages/${folder}/${source})\n\n`;
    markdown += '| API | 类型签名 |\n| --- | --- |\n';
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
  }
  return markdown;
}
if (process.argv.includes('--write')) {
  await writeFile('docs/api.md', await reference());
  console.log('Updated docs/api.md from runtime exports and declarations');
}
