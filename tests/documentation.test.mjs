import test from 'node:test';
import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { documentationSites, sitePages } from '../apps/docs/navigation.mjs';
import { build } from '../apps/docs/build.mjs';
import { root, workspacePackages } from '../scripts/lib/workspace.mjs';

test('every public package owns its documentation and follows its own version', async () => {
  const packages=await workspacePackages();
  const sites=(await documentationSites(packages)).filter(site=>site.packageName);
  assert.deepEqual(sites.map(site=>site.packageName).sort(),packages.filter(pkg=>pkg.manifest.reactiveMp.release.type==='public').map(pkg=>pkg.manifest.name).sort());
  for (const site of sites) {
    assert.ok(sitePages(site).every(([, , source])=>source.startsWith(site.packageRoot+'/docs/')));
    const api=await readFile(path.join(root,site.packageRoot,'docs/api.md'),'utf8');
    for (const [, name] of api.matchAll(/^## (.+)$/gm)) assert.ok(name===site.packageName || name.startsWith(site.packageName+'/'));
  }
  const changed=structuredClone(packages);
  const component=changed.find(pkg=>pkg.folder==='components');
  component.manifest.version='7.8.9';
  assert.equal((await documentationSites(changed)).find(site=>site.id==='components').version,'7.8.9');
  delete component.manifest.reactiveMp.docs;
  await assert.rejects(()=>documentationSites(changed),/declare reactiveMp.docs/);
});

test('all public sites can be built separately and moved outside the workspace', async () => {
  await mkdir(path.join(root,'artifacts'),{recursive:true});
  const output=await mkdtemp(path.join(root,'artifacts/docs-test-'));
  const detached=await mkdtemp(path.join(os.tmpdir(),'reactive-mp-docs-'));
  try {
    const sites=(await documentationSites()).filter(site=>site.packageName);
    const marker=path.join(output,sites[0].id,'keep.txt');
    for (const site of sites) {
      await build({packageName:site.packageName,outputRoot:output});
      const destination=path.join(detached,site.id);
      await cp(path.join(output,site.id),destination,{recursive:true});
      const index=JSON.parse(await readFile(path.join(destination,'assets/search-index.json'),'utf8'));
      assert.deepEqual(index.map(page=>page.href),sitePages(site).map(([slug])=>slug+'.html'));
      const html=await readFile(path.join(destination,'index.html'),'utf8');
      assert.ok(html.includes(`v${site.version}`));
      assert.ok(!html.includes('href="architecture.html"'));
      for (const [slug] of sitePages(site)) {
        const body=await readFile(path.join(destination,slug+'.html'),'utf8');
        for (const [, href] of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
          if (/^[a-z]+:/i.test(href)) continue;
          assert.ok(!href.startsWith('/'),'resources must remain relative after relocation');
          const file=href.split('#')[0] || slug+'.html';
          const target=path.resolve(destination,file);
          assert.ok(!path.relative(destination,target).startsWith('..'));
          await access(target);
        }
      }
      if (site.id===sites[0].id) await writeFile(marker,'keep');
    }
    assert.equal(await readFile(marker,'utf8'),'keep','single-package builds must preserve adjacent sites');
    await assert.rejects(()=>build({packageName:'@reactive-mp/runtime',outputRoot:output}),/Unknown public documentation package/);
    await assert.rejects(()=>build({outputRoot:'packages'}),/documentation output must/);
  } finally {await rm(output,{recursive:true,force:true});await rm(detached,{recursive:true,force:true});}
});
