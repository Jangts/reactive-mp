import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { workspacePackages } from '../scripts/lib/workspace.mjs';
async function walk(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    if (item.isDirectory()) files.push(...await walk(`${dir}/${item.name}`));
    else if (item.name.endsWith('.js')) files.push(`${dir}/${item.name}`);
  }
  return files;
}
test('package imports follow declared dependencies and ESM sources load without a platform', async () => {
  for (const {folder:name,manifest} of await workspacePackages()) {
    await import(manifest.name);
    for (const file of await walk(`packages/${name}/${manifest.miniprogram ?? 'src'}`)) {
      const source = await readFile(file, 'utf8');
      for (const [, specifier] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
        if (specifier.startsWith('.')) {
          assert.ok(specifier.endsWith('.js'), file + ': explicit ESM extension required');
          assert.ok(!specifier.includes('/packages/'), 'no source boundary bypass');
        } else {
          const dependency = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
          assert.ok(manifest.dependencies?.[dependency], `${file}: undeclared ${dependency}`);
        }
      }
      if (['shared', 'reactivity', 'store'].includes(name)) assert.ok(!/\bwx\./.test(source), `${file}: platform dependency in base package`);
    }
  }
});
test('prepared host modules resolve the same public capabilities without npm aliases', async () => {
  const core = await import('reactive-mp');
  for (const host of ['playground', 'integration', 'scenarios']) {
    const artifact = await import(`../examples/${host}/vendor/reactive-mp/src/index.js`);
    assert.deepEqual(Object.keys(artifact), Object.keys(core));
    const [value, set] = artifact.useSignal(1);
    const doubled = artifact.computed(() => value() * 2);
    set(2); assert.equal(doubled(), 4);
  }
});
