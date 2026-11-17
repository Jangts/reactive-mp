import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { planPackageVersions, packageLockVersionIssues } from '../scripts/lib/package-versions.mjs';

function pkg(name, version, type = 'public', dependencies = {}, owner) {
  return {
    folder: name.split('/').at(-1),
    manifest: {name, version, dependencies, reactiveMp: {release: {type, ...(owner ? {owner} : {})}}},
  };
}

test('public versions remain independent while owned and shared internal versions follow their release owners', () => {
  const packages = [
    pkg('reactive-mp','2.3.0','public',{'@reactive-mp/runtime':'1.0.0','@reactive-mp/reactivity':'0.6.0'}),
    pkg('@reactive-mp/reactivity','0.7.2','public',{'@reactive-mp/shared':'1.0.0'}),
    pkg('@reactive-mp/components','0.9.0','public',{'@reactive-mp/runtime':'1.0.0','@reactive-mp/fields':'0.1.0'}),
    pkg('@reactive-mp/runtime','1.0.0','shared-internal',{'@reactive-mp/shared':'1.0.0','@reactive-mp/reactivity':'0.6.0'}),
    pkg('@reactive-mp/shared','1.0.0','shared-internal'),
    pkg('@reactive-mp/fields','0.1.0','internal',{},'@reactive-mp/components'),
  ];
  packages[2].manifest.peerDependencies = {'@reactive-mp/reactivity':'^0.7.0'};
  packages[2].manifest.dependencies.external = '^4.0.0';
  const original = structuredClone(packages);
  const plan = planPackageVersions(packages,'reactive-mp');
  const manifests = new Map(plan.map(item=>[item.manifest.name,item.manifest]));
  assert.deepEqual([...manifests.values()].map(item=>item.version),['2.3.0','0.7.2','0.9.0','2.3.0','2.3.0','0.9.0']);
  assert.equal(manifests.get('@reactive-mp/components').dependencies['@reactive-mp/fields'],'0.9.0');
  assert.equal(manifests.get('@reactive-mp/components').dependencies['@reactive-mp/runtime'],'2.3.0');
  assert.equal(manifests.get('@reactive-mp/runtime').dependencies['@reactive-mp/reactivity'],'0.7.2');
  assert.equal(manifests.get('@reactive-mp/components').dependencies.external,'^4.0.0');
  assert.equal(manifests.get('@reactive-mp/components').peerDependencies['@reactive-mp/reactivity'],'^0.7.0');
  assert.deepEqual(packages,original,'planning must not mutate manifests before ownership validation succeeds');
});

test('invalid ownership cannot create a partial synchronization plan', () => {
  const main=pkg('reactive-mp','1.0.0');
  assert.throws(()=>planPackageVersions([main,pkg('unknown','1.0.0','other')],'reactive-mp'),/declare reactiveMp.release.type/);
  assert.throws(()=>planPackageVersions([main,pkg('owned','1.0.0','internal',{},'missing')],'reactive-mp'),/missing version owner/);
  assert.throws(()=>planPackageVersions([main,pkg('owned','1.0.0','internal',{},'reactive-mp')],'reactive-mp'),/must depend on it/);
  assert.throws(()=>planPackageVersions([main],'missing'),/must name a public workspace package/);
  assert.throws(()=>planPackageVersions([
    main,pkg('first','1.0.0','internal',{second:'1.0.0'},'second'),pkg('second','1.0.0','internal',{first:'1.0.0'},'first'),
  ],'reactive-mp'),/cyclic version ownership/);
});

test('the lockfile must reflect independently updated public packages and synchronized dependencies', () => {
  const plan=planPackageVersions([
    pkg('reactive-mp','1.1.0','public',{shared:'1.0.0'}),
    pkg('shared','1.0.0','shared-internal'),
    pkg('wechat','0.2.0'),
  ],'reactive-mp');
  const lock={packages:Object.fromEntries(plan.map(item=>['packages/'+item.folder,structuredClone(item.manifest)]))};
  assert.deepEqual(packageLockVersionIssues(plan,lock),[]);
  lock.packages['packages/wechat'].version='0.1.0';
  lock.packages['packages/reactive-mp'].dependencies.shared='1.0.0';
  assert.deepEqual(packageLockVersionIssues(plan,lock),[
    'reactive-mp: lockfile dependencies.shared is stale',
    'wechat: lockfile version must be 0.2.0',
  ]);
});

test('the sync command repairs real manifests and lockfiles without bumping public packages', async () => {
  const temp=await mkdtemp(path.join(os.tmpdir(),'reactive-mp-versions-'));
  const exec=promisify(execFile);
  const env={...process.env,npm_config_cache:path.join(temp,'cache')};
  try {
    await mkdir(path.join(temp,'scripts/lib'),{recursive:true});
    for (const file of ['package-versions.mjs','lib/package-versions.mjs','lib/workspace.mjs']) {
      await copyFile('scripts/'+file,path.join(temp,'scripts',file));
    }
    await writeFile(path.join(temp,'package.json'),JSON.stringify({name:'version-fixture',private:true,workspaces:['packages/*'],reactiveMp:{mainPackage:'reactive-mp'}}));
    const packages=[
      pkg('reactive-mp','2.0.0','public',{'@reactive-mp/shared':'1.0.0'}),
      pkg('@reactive-mp/shared','1.0.0','shared-internal'),
      pkg('@reactive-mp/components','0.4.0','public',{'@reactive-mp/fields':'0.1.0'}),
      pkg('@reactive-mp/fields','0.1.0','internal',{},'@reactive-mp/components'),
    ];
    for (const item of packages) {
      await mkdir(path.join(temp,'packages',item.folder),{recursive:true});
      await writeFile(path.join(temp,'packages',item.folder,'package.json'),JSON.stringify(item.manifest));
    }
    await writeFile(path.join(temp,'package-lock.json'),JSON.stringify({lockfileVersion:3,packages:{}}));
    await assert.rejects(exec(process.execPath,['scripts/package-versions.mjs'],{cwd:temp,env}),/Run npm run versions:sync/);
    await exec(process.execPath,['scripts/package-versions.mjs','--write'],{cwd:temp,env});
    await exec(process.execPath,['scripts/package-versions.mjs'],{cwd:temp,env});
    const manifests=await Promise.all(packages.map(async item=>JSON.parse(await readFile(path.join(temp,'packages',item.folder,'package.json'),'utf8'))));
    assert.deepEqual(manifests.map(item=>item.version),['2.0.0','2.0.0','0.4.0','0.4.0']);
    assert.equal(manifests[0].dependencies['@reactive-mp/shared'],'2.0.0');
    assert.equal(manifests[2].dependencies['@reactive-mp/fields'],'0.4.0');
    const lock=await readFile(path.join(temp,'package-lock.json'),'utf8');
    await exec(process.execPath,['scripts/package-versions.mjs','--write'],{cwd:temp,env});
    assert.equal(await readFile(path.join(temp,'package-lock.json'),'utf8'),lock,'a second synchronization is idempotent');
  } finally {await rm(temp,{recursive:true,force:true});}
});
