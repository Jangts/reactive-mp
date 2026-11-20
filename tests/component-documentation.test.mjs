import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { componentCatalog, componentDocuments } from '../scripts/component-docs.mjs';
import { languageEntry } from '../apps/docs/public-site.mjs';

test('every shipped wrapper documents both page styles with the same working event bindings', async (t) => {
  let reactivePage;
  const previous = [Object.getOwnPropertyDescriptor(globalThis, 'Page'), Object.getOwnPropertyDescriptor(globalThis, 'Behavior')];
  globalThis.Page = value => { reactivePage = value; };
  globalThis.Behavior = options => options;
  t.after(() => {
    for (const [index, name] of ['Page', 'Behavior'].entries()) {
      if (previous[index]) Object.defineProperty(globalThis, name, previous[index]);
      else delete globalThis[name];
    }
  });
  const actual = [];
  for (const domain of ['form', 'video', 'swiper']) {
    for (const entry of await readdir(`packages/components/miniprogram/${domain}/components`, { withFileTypes: true })) {
      if (entry.isDirectory()) actual.push(`${domain}/${entry.name}`);
    }
  }
  assert.deepEqual(componentCatalog.map(item => `${item.domain}/${item.folder}`).sort(), actual.sort());
  assert.equal(componentCatalog.length, 22);
  const documents = await componentDocuments();
  for (const item of componentCatalog) {
    const example = `packages/components/docs/examples/${item.slug}`;
    const config = JSON.parse(await readFile(example + '/index.json', 'utf8'));
    const template = await readFile(example + '/index.wxml', 'utf8');
    const nativeSource = await readFile(example + '/index.js', 'utf8');
    const reactiveSource = await readFile(example + '/index.reactive.js', 'utf8');
    let page;
    vm.runInNewContext(nativeSource, { Page: value => { page = value; } });
    reactivePage = undefined;
    const moduleSource = reactiveSource.replace(/\.\.\/\.\.\/vendor\/(runtime|reactivity)\/src\/index\.js/g, (_, dependency) =>
      import.meta.resolve('@reactive-mp/' + dependency),
    );
    await import('data:text/javascript;base64,' + Buffer.from(moduleSource).toString('base64'));
    assert.ok(reactivePage, item.slug);
    const readData = data => JSON.parse(JSON.stringify(data));
    assert.deepEqual(readData(reactivePage.data), readData(page.data), item.slug);
    assert.ok(page && typeof page.data === 'object', item.slug);
    assert.doesNotThrow(() => JSON.stringify(page.data));
    for (const target of Object.values(config.usingComponents)) {
      assert.ok(target.startsWith('/vendor/components/miniprogram/'));
      await access('packages/' + target.slice('/vendor/'.length) + '.json');
    }
    for (const [, handler] of template.matchAll(/bind(?::)?[a-z]+="([a-zA-Z]\w*)"/g)) {
      assert.equal(typeof page[handler], 'function', item.slug + ': ' + handler);
      assert.equal(typeof reactivePage[handler], 'function', item.slug + ': reactive ' + handler);
    }
    if (page.onChange && page.onSubmit && item.domain === 'form') {
      const context = { setData(value) { this.data = value; } };
      page.onChange.call(context, { detail: { values: { value: 'edited' } } });
      assert.equal(context.data.model.value, 'edited');
      page.onSubmit.call(context, { detail: { values: { value: 'edited' } } });
      assert.equal(JSON.parse(context.data.result).value, 'edited');
    }
    const calls = [];
    const instance = {
      ...reactivePage,
      data: structuredClone(reactivePage.data),
      getPageId: () => `docs-${item.slug}`,
      setData(values, callback) { Object.assign(this.data, values); callback?.(); },
      selectComponent(selector) {
        return Object.fromEntries(['play', 'next', 'muteAll'].map(method => [method, () => calls.push([selector, method])]));
      },
    };
    for (const behavior of reactivePage.behaviors) behavior.lifetimes?.created?.call(instance);
    for (const behavior of reactivePage.behaviors) behavior.lifetimes?.attached?.call(instance);
    instance.onLoad?.({});
    instance.onReady?.();
    try {
      if (instance.onSubmit) {
        const values = { value: 'edited' };
        instance.onChange({ detail: { values } });
        instance.onSubmit({ detail: { values } });
        await Promise.resolve();
        assert.deepEqual(instance.data.model, values);
        assert.deepEqual(JSON.parse(instance.data.result), values);
      } else if (instance.onChange) {
        instance.onChange({ detail: { current: 1 } });
        await Promise.resolve();
        assert.equal(instance.data.current, 1);
      }
      for (const [selector, method] of [['#video', 'play'], ['#gallery', 'next'], ['#group', 'muteAll']]) {
        if (instance[method]) {
          instance[method]();
          assert.deepEqual(calls.at(-1), [selector, method]);
        }
      }
    } finally {
      instance.onUnload?.();
    }
    for (const locale of ['zh', 'en']) {
      const file = `packages/components/docs/${locale === 'en' ? 'en/' : ''}${item.slug}.md`;
      assert.equal(await readFile(file, 'utf8'), documents.get(file));
      const body = documents.get(file);
      assert.ok(body.includes((await readFile(example + '/index.json', 'utf8')).trim()));
      assert.ok(body.includes(nativeSource.trim()));
      assert.ok(body.includes(reactiveSource.trim()));
      assert.ok(body.includes(locale === 'en' ? 'js [Reactive composition]' : 'js [组合响应式]'));
      assert.ok(body.includes((await readFile(example + '/index.wxml', 'utf8')).trim()));
      assert.ok(body.includes(locale === 'en' ? '## Properties' : '## 属性'));
      assert.ok(body.includes(locale === 'en' ? '## FAQ and boundaries' : '## 常见问题与边界'));
    }
  }
});

test('language entry preserves route, query and fragment and honors saved language', () => {
  for (const [saved, browser, expected] of [[null,'zh-CN','zh'],[null,'en-US','en'],['en','zh-CN','en'],['zh','en-US','zh'],['invalid','zh-TW','zh']]) {
    let destination;
    vm.runInNewContext(languageEntry('input.html'), { localStorage: { getItem: () => saved }, navigator: { language: browser }, location: { search: '?demo=1', hash: '#properties', replace: value => { destination = value; } } });
    assert.equal(destination, `./${expected}/input.html?demo=1#properties`);
  }
});
