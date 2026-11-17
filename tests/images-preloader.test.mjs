import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createImagePool } from '../packages/images-preloader/miniprogram/utils/image-pool.js';
import { createImagesPreloader } from '../packages/images-preloader/miniprogram/utils/preloader.js';

const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
function host(pool = createImagePool()) {
  let images = [];
  const updates = [];
  const controller = createImagesPreloader(value => { images = value; updates.push(value); }, pool);
  const event = (image, detail) => ({ currentTarget: { dataset: { id: image.id } }, detail });
  return {
    ...controller, updates,
    get images() { return images; },
    load(image = images[0], detail = { width: 640, height: 480 }) { controller.onImageLoad(event(image, detail)); },
    error(image = images[0]) { controller.onImageError(event(image, { errMsg: 'broken image' })); },
  };
}

test('batches filter empty items, preserve order/counts and reuse pending and loaded URLs', async () => {
  const pool = createImagePool();
  const view = host(pool);
  const first = view.loadImages(['/a.png', '', null, undefined, false, ' ', '/a.png', '/b.png']);
  const second = view.loadImages(['/a.png']);
  assert.equal(view.images.length, 2);
  view.error(view.images.find(image => image.src === '/b.png'));
  view.load();
  const report = await first;
  assert.deepEqual([report.total, report.done, report.fail], [3, 2, 1]);
  assert.deepEqual(report.results.map(result => result.src), ['/a.png', '/a.png', '/b.png']);
  assert.deepEqual(report.results.map(result => result.status), ['loaded', 'loaded', 'error']);
  assert.equal(report.results[2].errMsg, 'broken image');
  assert.equal((await second).done, 1);
  assert.deepEqual(view.images, []);
  assert.deepEqual(pool.getSize('/a.png'), { width: 640, height: 480 });
  const cached = await view.loadImages(['/a.png']);
  assert.equal(cached.done, 1);
  assert.deepEqual(view.images, []);
  assert.deepEqual(await view.loadImages([]), { total: 0, done: 0, fail: 0, results: [] });
  const retry = view.loadImages(['/b.png']);
  assert.equal(view.images.length, 1);
  view.load();
  assert.equal((await retry).done, 1);
  view.dispose();
});

test('detaching a node owner cancels its batch and transfers the load to another host', async () => {
  const pool = createImagePool();
  const first = host(pool), second = host(pool);
  const a = first.loadImages(['/shared.png']);
  const oldImage = first.images[0];
  const b = second.loadImages(['/shared.png']);
  assert.equal(second.images.length, 0);
  const before = first.updates.length;
  first.dispose(); first.dispose();
  assert.equal(first.updates.length, before);
  assert.equal((await a).results[0].status, 'cancelled');
  assert.equal(second.images.length, 1);
  assert.notEqual(second.images[0].id, oldImage.id);
  // Native events already queued for the removed node cannot complete the replacement.
  pool.settle(oldImage.id, { status: 'loaded', width: 1, height: 1 });
  assert.deepEqual(pool.getSize('/shared.png'), {});
  second.load();
  assert.equal((await b).done, 1);
  second.dispose();
});

test('timeout belongs to each waiter, and the last timeout removes the node and permits retry', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const view = host();
  const short = view.loadImages(['/a.png'], { timeout: 10 });
  const long = view.loadImages(['/a.png'], { timeout: 100 });
  const original = view.images[0];
  t.mock.timers.tick(10);
  assert.equal((await short).results[0].status, 'timeout');
  assert.equal(view.images.length, 1);
  assert.equal(view.images[0].id, original.id);
  view.load();
  assert.equal((await long).done, 1);
  const timeout = view.loadImages(['/b.png'], { timeout: 10 });
  t.mock.timers.tick(10);
  assert.equal((await timeout).fail, 1);
  assert.equal(view.images.length, 0);
  const retry = view.loadImages(['/b.png']);
  view.load();
  assert.equal((await retry).done, 1);
  view.dispose();
});

test('delay waits for ready, preserves timeout and always settles when unloaded before ready', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const view = host();
  const pending = view.loadImages(['/a.png'], { delay: true, timeout: 10 });
  t.mock.timers.tick(100);
  assert.equal(view.images.length, 0);
  view.ready();
  assert.equal(view.images.length, 1);
  t.mock.timers.tick(10);
  assert.equal((await pending).results[0].status, 'timeout');
  const started = view.loadImages(['/b.png'], { delay: true });
  view.load();
  assert.equal((await started).done, 1);
  view.dispose();
  const deferred = host();
  const cancelled = deferred.loadImages(['/a.png', '/b.png'], { delay: true });
  deferred.dispose(); deferred.ready();
  assert.equal((await cancelled).fail, 2);
  const after = await deferred.loadImages(['/c.png']);
  assert.equal(after.results[0].status, 'cancelled');
  assert.equal(deferred.updates.length, 0);
});

test('multiple callers release independently and last detach cancels the shared request', async () => {
  const pool = createImagePool();
  const first = host(pool), second = host(pool);
  const a = first.loadImages(['/same.png', '/same.png']);
  const b = second.loadImages(['/same.png']);
  second.dispose();
  assert.equal((await b).fail, 1);
  assert.equal(first.images.length, 1);
  first.dispose();
  assert.equal((await a).fail, 2);
  const retry = host(pool);
  const next = retry.loadImages(['/same.png']);
  retry.load();
  assert.equal((await next).done, 1);
  retry.dispose();
});

test('size cache is bounded, returns copies and clearing never breaks pending loads', async () => {
  const pool = createImagePool(2);
  const view = host(pool);
  for (const src of ['/a.png', '/b.png']) {
    const batch = view.loadImages([src]); view.load(); await batch;
  }
  pool.getSize('/a.png').width = 1;
  assert.equal(pool.getSize('/a.png').width, 640);
  const batch = view.loadImages(['/c.png']);
  view.load(); await batch;
  assert.deepEqual(pool.getSize('/b.png'), {});
  const pending = view.loadImages(['/d.png']);
  pool.clear();
  assert.deepEqual(pool.getSize('/a.png'), {});
  view.load(); await pending;
  pool.clear('/d.png');
  assert.deepEqual(pool.getSize('/d.png'), {});
  view.dispose();
});

test('invalid batch arguments reject without creating native nodes', async () => {
  const view = host();
  await assert.rejects(view.loadImages(null), /images must be an array/);
  for (const timeout of [-1, Infinity, NaN, '10']) {
    await assert.rejects(view.loadImages(['/a.png'], { timeout }), /timeout/);
  }
  await assert.rejects(view.loadImages(['/a.png'], { delay: 'true' }), /delay/);
  assert.deepEqual(view.images, []);
  view.dispose();
});

globalThis.Behavior = options => options;
let definition;
globalThis.Component = options => { definition = options; };
globalThis.Page = options => { definition = options; };
await import('../packages/images-preloader/miniprogram/components/images-preloader/index.js');
const component = definition;
const { definePage } = await import('@reactive-mp/runtime');
const { useImagesPreloader, getLoadedImageSizeByUrl, clearImageCache } = await import('@reactive-mp/images-preloader');

function mount(options) {
  const instance = {
    data: { ...options.data }, properties: {},
    getPageId: () => 'preloader-test', selectOwnerComponent: () => null,
    triggerEvent() {},
    setData(update, callback) { Object.assign(this.data, update); callback?.(); },
  };
  Object.assign(instance, options.methods || Object.fromEntries(Object.entries(options).filter(([, value]) => typeof value === 'function')));
  for (const behavior of options.behaviors || []) { behavior.lifetimes?.created?.call(instance); }
  for (const behavior of options.behaviors || []) { behavior.lifetimes?.attached?.call(instance); }
  options.lifetimes?.attached?.call(instance); options.onLoad?.call(instance);
  return {
    instance,
    ready() { options.lifetimes?.ready?.call(instance); options.onReady?.call(instance); },
    detach() { options.lifetimes?.detached?.call(instance); options.onUnload?.call(instance); },
  };
}

test('ordinary pages can call the reactive component and view data contains only serializable jobs', async () => {
  clearImageCache();
  const view = mount(component);
  const promise = view.instance.loadImages(['/native.png'], { delay: true });
  await tick(); assert.deepEqual(view.instance.data.images, []);
  view.ready(); await tick();
  const job = view.instance.data.images[0];
  assert.deepEqual(Object.keys(job).sort(), ['id', 'src']);
  assert.doesNotThrow(() => JSON.stringify(view.instance.data));
  view.instance.onImageLoad({ currentTarget: { dataset: { id: job.id } }, detail: { width: 320, height: 200 } });
  assert.equal((await promise).done, 1); await tick();
  assert.deepEqual(view.instance.data.images, []);
  assert.deepEqual(getLoadedImageSizeByUrl('/native.png'), { width: 320, height: 200 });
  clearImageCache('/native.png');
  assert.deepEqual(getLoadedImageSizeByUrl('/native.png'), {});
  const pending = view.instance.loadImages(['/detach.png']);
  view.detach();
  assert.equal((await pending).results[0].status, 'cancelled');
});

test('useImagesPreloader works directly in a Reactive Page and disposes deferred requests', async () => {
  definePage(() => useImagesPreloader());
  const view = mount(definition);
  const promise = view.instance.loadImages(['/page.png'], { delay: true });
  view.ready(); await tick();
  assert.equal(view.instance.data.images.length, 1);
  view.detach();
  assert.equal((await promise).fail, 1);
});

test('prepared native package includes a hidden image template with eager loading and stable job keys', async () => {
  const base = 'examples/integration/vendor/images-preloader/miniprogram/components/images-preloader/index';
  assert.equal(JSON.parse(await readFile(base + '.json', 'utf8')).component, true);
  const template = await readFile(base + '.wxml', 'utf8');
  assert.match(template, /lazy-load="\{\{false\}\}"/);
  assert.match(template, /wx:key="id"/);
  const entry = await import('../examples/integration/vendor/images-preloader/miniprogram/index.js');
  assert.deepEqual(Object.keys(entry), ['clearImageCache', 'getLoadedImageSizeByUrl', 'useImagesPreloader']);
});
