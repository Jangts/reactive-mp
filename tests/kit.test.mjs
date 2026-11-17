import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveNativeExport } from 'reactive-mp/native-tools';

test('kit entries avoid native side effects and forward the independent Store without copying it', async () => {
  const names = ['App', 'Page', 'Component', 'Behavior', 'wx'];
  const descriptors = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  for (const name of names) {
    Object.defineProperty(globalThis, name, { configurable: true, get() { throw Error('unexpected native access: ' + name); } });
  }
  try {
    const kit = await import('@reactive-mp/kit');
    for (const name of ['wechat', 'images-preloader', 'store']) {
      const domain = await import('@reactive-mp/kit/' + name);
      for (const [key, value] of Object.entries(domain)) {
        if (key !== 'default') assert.equal(kit[key], value);
      }
    }
    const direct = await import('@reactive-mp/store');
    const forwarded = await import('@reactive-mp/kit/store');
    assert.equal(kit.defineStore, direct.defineStore);
    assert.equal(forwarded.default, direct.default);
    const { useSignal } = await import('@reactive-mp/reactivity');
    const useCounter = kit.defineStore('kit-counter', () => {
      const [count, setCount] = useSignal(0);
      return { count, increment: () => setCount(count() + 1) };
    });
    const first = useCounter();
    const second = useCounter();
    first.increment();
    assert.equal(second.count(), 1);
    assert.equal(kit.storeToRefs(second).count, direct.storeToRefs(first).count);
    useCounter.dispose();
    for (const name of ['wechat', 'images-preloader']) {
      await assert.rejects(import('@reactive-mp/' + name), { code: 'ERR_MODULE_NOT_FOUND' });
    }
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});

test('kit exports resolve consistently for Node and native preparation while utilities remain internal', async () => {
  const root = path.resolve('packages/kit');
  const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  for (const suffix of ['', '/wechat', '/wechat/wx', '/wechat/network', '/images-preloader', '/store', '/images-preloader/components/images-preloader/index.js', '/images-preloader/components/images-preloader/index.json']) {
    assert.equal(fileURLToPath(import.meta.resolve(manifest.name + suffix)), path.join(root, resolveNativeExport(manifest, suffix)));
  }
  for (const suffix of ['/wechat/result.js', '/images-preloader/utils/image-pool.js']) {
    assert.throws(() => import.meta.resolve(manifest.name + suffix), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
    assert.throws(() => resolveNativeExport(manifest, suffix), /unresolved native export/);
  }
});
