import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, symlink, rm, mkdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { renderMarkdown, expand } from '../apps/docs/render.mjs';
import { readSource, assertOwnedPath, root } from '../scripts/lib/workspace.mjs';
import { prepareNativeSources } from 'reactive-mp/native-tools';

test('documentation treats HTML as text and rejects executable link protocols', () => {
  const html=renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)');
  assert.ok(!html.includes('<script>'));assert.ok(!html.includes('href="javascript:'));assert.ok(html.includes('&lt;script&gt;'));
});
test('source includes reject absolute paths, traversal and symlinks outside allowed directories', async () => {
  await assert.rejects(()=>expand('<<< /etc/passwd'),/relative/);
  await assert.rejects(()=>expand('<<< packages/../../outside'),/allowed/);
  const temp=await mkdtemp(path.join(os.tmpdir(),'rmp-path-'));
  const inside=await mkdtemp(path.join(root,'tests/.source-path-'));
  try {
    await writeFile(path.join(temp,'private'),'synthetic value');
    await symlink(path.join(temp,'private'),path.join(inside,'link'));
    await assert.rejects(()=>readSource(path.relative(root,path.join(inside,'link'))),/symlink/);
    await assert.rejects(()=>assertOwnedPath(path.relative(root,path.join(inside,'link'))),/symlink/);
  }finally{await rm(temp,{recursive:true,force:true});await rm(inside,{recursive:true,force:true});}
});
test('native package preparation works outside a workspace and preserves unknown files', async () => {
  const temp=await realpath(await mkdtemp(path.join(os.tmpdir(),'rmp-native-')));
  try {
    const output=path.join(temp,'vendor');await prepareNativeSources(output);
    const source=await readFile(path.join(output,'reactive-mp/src/index.js'),'utf8');assert.ok(!source.includes('@reactive-mp/'));
    await writeFile(path.join(output,'user.txt'),'keep');
    await assert.rejects(()=>prepareNativeSources(output),/unowned/);
    assert.equal(await readFile(path.join(output,'user.txt'),'utf8'),'keep');
  }finally{await rm(temp,{recursive:true,force:true});}
});
