import test from 'node:test';
import assert from 'node:assert/strict';
import { access, cp, readdir, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  documentationPackages,
  documentationSites,
  siteForPackage,
  sitePages,
} from '../apps/docs/navigation.mjs';
import { verifyPublicSite } from '../apps/docs/public-site.mjs';
import { build } from '../apps/docs/build.mjs';
import { root, workspacePackages } from '../scripts/lib/workspace.mjs';

test('public packages keep their own documentation and versions independently of site ownership', async () => {
  const packages = await workspacePackages();
  const documents = await documentationPackages(packages);
  const sites = (await documentationSites(packages)).filter(site => site.packageName);
  const publicPackages = packages.filter(pkg => pkg.manifest.reactiveMp.release.type === 'public');
  assert.deepEqual(documents.map(doc => doc.packageName).sort(), publicPackages.map(pkg => pkg.manifest.name).sort());
  for (const doc of documents) {
    assert.ok(sitePages(doc).every(([, , source]) => source.startsWith(doc.packageRoot + '/docs/')));
    const api = await readFile(path.join(root, doc.packageRoot, 'docs/api.md'), 'utf8');
    for (const [, name] of api.matchAll(/^## (.+)$/gm)) {
      assert.ok(name === doc.packageName || name.startsWith(doc.packageName + '/'));
    }
  }
  assert.equal(documents.length, 5);
  assert.equal(sites.length, 4);
  assert.ok(!documents.some(doc => ['wechat', 'images-preloader'].includes(doc.id)));
  const kit = sites.find(site => site.id === 'kit');
  assert.ok(sitePages(kit).some(([slug]) => slug === 'wechat-guide'));
  assert.ok(sitePages(kit).some(([slug]) => slug === 'images-preloader-guide'));
  assert.ok(sites.some(site => site.id === 'store'));
  assert.ok(!sites.some(site => site.id === 'reactivity'));
  const main = sites.find(site => site.id === 'reactive-mp');
  assert.equal(siteForPackage(sites, '@reactive-mp/reactivity'), main);
  assert.equal(siteForPackage(sites, 'reactivity'), main);
  assert.equal(siteForPackage(sites, '@reactive-mp/runtime'), undefined);
  assert.deepEqual(main.documentation.map(doc => doc.packageName).sort(), ['@reactive-mp/reactivity', 'reactive-mp']);
  assert.deepEqual(
    sitePages(main).filter(([, , source]) => source.startsWith('packages/reactivity/')).map(([slug]) => slug),
    ['reactivity-index', 'reactivity-getting-started', 'reactivity-guide', 'reactivity-api'],
  );
  const reactivity = packages.find(pkg => pkg.folder === 'reactivity');
  assert.equal(reactivity.manifest.private, undefined);
  assert.ok(reactivity.manifest.files.includes('docs'));
  assert.equal(reactivity.manifest.homepage, 'https://reactive-mp-docs.pages.jangts.cafe/reactivity-index.html');

  const changed = structuredClone(packages);
  const component = changed.find(pkg => pkg.folder === 'components');
  component.manifest.version = '7.8.9';
  changed.find(pkg => pkg.folder === 'reactivity').manifest.version = '3.4.5';
  const changedSites = await documentationSites(changed);
  assert.equal(changedSites.find(site => site.id === 'components').version, '7.8.9');
  const changedMain = changedSites.find(site => site.id === 'reactive-mp');
  assert.equal(changedMain.version, main.version);
  assert.ok(changedMain.groups.some(group => group.title === 'Reactivity · v3.4.5'));
  delete component.manifest.reactiveMp.docs;
  await assert.rejects(() => documentationPackages(changed), /declare reactiveMp.docs/);
});

test('sites remain portable and selecting reactivity builds only its main host', async () => {
  await mkdir(path.join(root, 'artifacts'), { recursive: true });
  const output = await mkdtemp(path.join(root, 'artifacts/docs-test-'));
  const detached = await mkdtemp(path.join(os.tmpdir(), 'reactive-mp-docs-'));
  try {
    const sites = (await documentationSites()).filter(site => site.packageName);
    const marker = path.join(output, sites[0].id, 'keep.txt');
    for (const site of sites) {
      await build({ packageName: site.packageName, outputRoot: output });
      const destination = path.join(detached, site.id);
      await cp(path.join(output, site.id), destination, { recursive: true });
      await verifyPublicSite(destination);
      const manifest = JSON.parse(await readFile(path.join(destination, 'site-manifest.json'), 'utf8'));
      assert.deepEqual(manifest.locales, ['zh', 'en']);
      assert.deepEqual(manifest.pages, sitePages(site).map(([slug]) => slug));
      for (const [slug] of sitePages(site)) {
        for (const locale of ['zh', 'en']) {
          const body = await readFile(path.join(destination, locale, slug + '.html'), 'utf8');
          assert.ok(body.includes('lang="' + (locale === 'zh' ? 'zh-CN' : 'en') + '"'));
          assert.ok(body.includes(`/${locale === 'zh' ? 'en' : 'zh'}/${slug === 'index' ? '' : slug + '.html'}`));
          assert.ok(body.includes('rel="canonical"'));
          assert.ok(body.includes(`v${site.version}`));
          assert.ok(!body.includes('href="/architecture.html"'));
          if (site.id === 'components' && ['getting-started', 'form', 'input', 'video', 'swiper'].includes(slug)) {
            assert.match(body, /class="vp-code-group(?:\s[^"\r\n]*)?"/);
            assert.ok(body.includes(locale === 'zh' ? '原生配置式' : 'Native configuration'));
            assert.ok(body.includes(locale === 'zh' ? '组合响应式' : 'Reactive composition'));
          }
        }
      }
      const chunks = await readdir(path.join(destination, 'assets/chunks'));
      for (const locale of ['zh', 'en']) assert.ok(chunks.some(name => name.startsWith('@localSearchIndex' + locale + '.')));
      if (site.id === sites[0].id) await writeFile(marker, 'keep');
    }
    const selected = await build({ packageName: '@reactive-mp/reactivity', outputRoot: output });
    assert.deepEqual(selected.map(site => site.id), ['reactive-mp']);
    await assert.rejects(() => access(path.join(output, 'reactivity')), { code: 'ENOENT' });
    const guide = await readFile(path.join(output, 'reactive-mp/zh/reactivity-guide.html'), 'utf8');
    assert.ok(guide.includes('href="/zh/reactivity-api.html"'));
    assert.ok(guide.includes('Reactivity · v1.0.0'));
    const api = await readFile(path.join(output, 'reactive-mp/en/reactivity-api.html'), 'utf8');
    assert.ok(api.includes('@reactive-mp/reactivity/signal'));
    assert.ok(api.includes('source/packages/reactivity/index.d.ts.html'));
    assert.equal(await readFile(marker, 'utf8'), 'keep', 'targeted builds must preserve adjacent sites');
    await assert.rejects(() => build({ packageName: '@reactive-mp/runtime', outputRoot: output }), /Unknown public documentation package/);
    await assert.rejects(() => build({ outputRoot: 'packages' }), /documentation output must/);
  } finally {
    await rm(output, { recursive: true, force: true });
    await rm(detached, { recursive: true, force: true });
  }
});
