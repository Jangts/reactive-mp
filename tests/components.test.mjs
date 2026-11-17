import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolveNativeExport } from 'reactive-mp/native-tools';

test('component logic entries share implementations without reading native globals or registering wrappers', async () => {
  const names = ['App', 'Page', 'Component', 'Behavior', 'wx'];
  const descriptors = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  for (const name of names) {
    Object.defineProperty(globalThis, name, {configurable:true, get() {throw Error('unexpected native access: '+name);}});
  }
  try {
    const components = await import('@reactive-mp/components');
    for (const name of ['form','video','swiper']) {
      const domain = await import('@reactive-mp/components/'+name);
      for (const [key, value] of Object.entries(domain)) assert.equal(components[key],value);
    }
    const form=components.createFormController({initialValues:{name:'ok'}});
    form.registerField('name',{rules:[{required:true}]});
    assert.equal((await form.validate()).status,'valid');
    form.dispose();
  } finally {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis,name,descriptor);
      else delete globalThis[name];
    }
  }
});

test('Node and native preparation resolve public component paths and keep internal utilities private', async () => {
  const root=path.resolve('packages/components');
  const manifest=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
  for (const suffix of ['/form','/video','/swiper','/video/participant','/form/components/input/index.js','/video/components/video/index.js','/swiper/components/media-item/index.json']) {
    assert.equal(fileURLToPath(import.meta.resolve(manifest.name+suffix)),path.join(root,resolveNativeExport(manifest,suffix)));
  }
  const internal='/form/utils/rules.js';
  assert.throws(()=>import.meta.resolve(manifest.name+internal),{code:'ERR_PACKAGE_PATH_NOT_EXPORTED'});
  assert.throws(()=>resolveNativeExport(manifest,internal),/unresolved native export/);
});
