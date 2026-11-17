import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareDemoMedia } from '../examples/integration/utils/video-demo.js';

test('demo videos materialize as distinct sandbox files, reuse valid cache and repair a truncated file', () => {
  const files = new Map(); let writes = 0;
  const api = {env:{USER_DATA_PATH:'wxfile://usr'},getFileSystemManager:()=>({
    statSync(path) { if(!files.has(path)) {throw Error('ENOENT');} return {size:files.get(path).length}; },
    writeFileSync(path, data, encoding) { assert.equal(encoding,'base64'); files.set(path,Buffer.from(data,encoding)); writes++; },
  })};
  const clips = prepareDemoMedia(api);
  assert.equal(clips.length,3);
  assert.equal(new Set(clips.map(clip=>clip.src)).size,3);
  for(const clip of clips) {
    assert.ok(clip.src.startsWith('wxfile://usr/rmp-demo-'));
    assert.equal(clip.duration,12);
    assert.equal(files.get(clip.src).subarray(4,8).toString(),'ftyp');
    assert.equal(Object.hasOwn(clip,'base64'),false);
  }
  assert.equal(writes,3);
  assert.deepEqual(prepareDemoMedia(api),clips); assert.equal(writes,3);
  files.set(clips[0].src,Buffer.from('broken'));
  prepareDemoMedia(api); assert.equal(writes,4);
});
test('cache write failures surface instead of returning an unusable source', () => {
  const api={env:{USER_DATA_PATH:'wxfile://usr'},getFileSystemManager:()=>({statSync(){throw Error('ENOENT');},writeFileSync(){throw Error('disk full');}})};
  assert.throws(()=>prepareDemoMedia(api),/disk full/);
});
