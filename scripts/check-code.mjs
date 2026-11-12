/** 正式源码结构检查：记录全部模块，检查解析、文件自述及显式控制流边界。 */
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { root, assertOwnedPath } from './lib/workspace.mjs';

/** 枚举生产源码、工具与宿主；生成文件和个人配置不属于源码分母。 */
async function modules(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (
      ['vendor', 'dist', 'node_modules'].includes(entry.name) ||
      entry.name.startsWith('.vendor-stage-')
    ) {
      continue;
    }
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await modules(file)));
    } else if (/\.(?:[cm]?js|ts)$/.test(entry.name)) {
      files.push(file);
    }
  }
  return files;
}
const files = (
  await Promise.all(
    ['packages', 'scripts', 'apps/docs', 'examples'].map((folder) =>
      modules(path.join(root, folder)),
    ),
  )
).flat();
const errors = [];
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const body = source.replace(/^#![^\n]*\n/, '');
  if (!body.startsWith('/**')) {
    errors.push(`${file}: missing module responsibility comment`);
  }
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  for (const diagnostic of ast.parseDiagnostics) {
    errors.push(
      `${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
    );
  }
  if (file.endsWith('.d.ts')) {
    continue;
  }
  function requireBlock(statement) {
    if (statement && !ts.isBlock(statement) && !ts.isIfStatement(statement)) {
      errors.push(
        `${file}:${ast.getLineAndCharacterOfPosition(statement.pos).line + 1}: use an explicit block`,
      );
    }
  }
  function visit(node) {
    if (ts.isIfStatement(node)) {
      requireBlock(node.thenStatement);
      requireBlock(node.elseStatement);
    } else if (
      ts.isForStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isDoStatement(node)
    ) {
      requireBlock(node.statement);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
const output = await assertOwnedPath('artifacts/code-inventory.json');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(
  output,
  JSON.stringify(
    { modules: files.map((file) => path.relative(root, file)).sort(), errors },
    null,
    2,
  ),
);
if (errors.length) {
  throw Error(errors.join('\n'));
}
console.log(
  `Verified ${files.length} source modules; inventory: artifacts/code-inventory.json`,
);
