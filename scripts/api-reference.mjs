import { readFile, writeFile } from 'node:fs/promises';
import ts from 'typescript';
export const packageNames = ['shared', 'reactivity', 'store', 'runtime', 'reactive-mp'];
export async function reference() {
  const files = packageNames.map(name => `packages/${name}/index.d.ts`);
  const program = ts.createProgram(files, { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext });
  const checker = program.getTypeChecker();
  let markdown = '# API 参考\n\n由实际运行时 exports 和各包类型声明共同生成。修改 API 后运行 `npm run docs:api`；检查会阻止未同步的导出和签名。\n\n';
  for (let i = 0; i < packageNames.length; i++) {
    const folder = packageNames[i];
    const manifest = JSON.parse(await readFile(`packages/${folder}/package.json`, 'utf8'));
    const runtime = await import(manifest.name);
    const file = program.getSourceFile(files[i]);
    const symbols = checker.getExportsOfModule(checker.getSymbolAtLocation(file));
    const declarations = new Map(symbols.map(symbol => [symbol.name, symbol]));
    markdown += `## ${manifest.name}\n\n[类型及完整签名](../packages/${folder}/index.d.ts) · [实现入口](../packages/${folder}/src/index.js)\n\n`;
    markdown += '| API | 类型签名 |\n| --- | --- |\n';
    for (const name of Object.keys(runtime).sort()) {
      const symbol = declarations.get(name);
      if (!symbol) throw Error(`${manifest.name}: exported ${name} has no declaration`);
      const type = checker.getTypeOfSymbolAtLocation(symbol, file);
      const signature = checker.typeToString(type, file, ts.TypeFormatFlags.NoTruncation).replaceAll('|', '\\|').replaceAll('`', '');
      markdown += `| ${name} | \`${signature}\` |\n`;
    }
    const declaredValues = symbols.filter(s => {
      const resolved = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
      return !!(resolved.flags & ts.SymbolFlags.Value);
    }).map(s => s.name);
    for (const name of declaredValues) if (!(name in runtime)) throw Error(`${manifest.name}: declared ${name} is not exported`);
    markdown += '\n';
  }
  return markdown;
}
if (process.argv.includes('--write')) {
  await writeFile('docs/api.md', await reference());
  console.log('Updated docs/api.md from runtime exports and declarations');
}
