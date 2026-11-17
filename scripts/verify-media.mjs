/** 验收示例素材的真实沙盒路径、播放进度、暂停续播和多视频分组。 */
import assert from 'node:assert/strict';
import { runWechatVerification } from './lib/wechat-verification.mjs';
await runWechatVerification(
  { output: 'artifacts/media-verification/result.json' },
  async (app, report) => {
    async function state(hook = false, id = 'player') {
      return app.evaluate(
        function (hook, id) {
          const page = getCurrentPages().slice(-1)[0];
          const data = (hook ? page : page.selectComponent('#' + id)).data;
          return {
            src: data.src,
            time: data.currentTime,
            playing: data.isPlaying,
            poster: data.showPoster,
            duration: data.mediaDuration,
            validPath: data.src.startsWith(wx.env.USER_DATA_PATH + '/'),
            bytes: wx.getFileSystemManager().statSync(data.src).size,
          };
        },
        hook,
        id,
      );
    }
    async function action(name, hook = false, id = 'player') {
      return app.evaluate(
        function (name, hook, id) {
          const page = getCurrentPages().slice(-1)[0];
          (hook ? page : page.selectComponent('#' + id))[name]();
          return true;
        },
        name,
        hook,
        id,
      );
    }
    async function until(get, predicate, label) {
      const deadline = Date.now() + 6000;
      let value;
      do {
        value = await get();
        if (predicate(value)) {
          return value;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (Date.now() < deadline);
      throw Error(label + ': ' + JSON.stringify(value));
    }
    for (const scenario of ['video-native', 'video-reactive', 'video-hooks']) {
      const page = await app.reLaunch('/pages/' + scenario + '/index');
      const hook = scenario === 'video-hooks';
      await action('play', hook);
      const first = await until(
        () => state(hook),
        (s) => s.playing && s.time > 0.25,
        'video did not start',
      );
      assert.equal(first.validPath, true);
      assert.equal(first.duration, 12);
      assert.ok(first.bytes > 100000);
      assert.equal(first.poster, false);
      await app.screenshot({
        path: `artifacts/media-verification/${scenario}-a.png`,
      });
      const later = await until(
        () => state(hook),
        (s) => s.time > first.time + 0.7,
        'video frame clock stalled',
      );
      await app.screenshot({
        path: `artifacts/media-verification/${scenario}-b.png`,
      });
      await action('pause', hook);
      const paused = await until(
        () => state(hook),
        (s) => !s.playing,
        'pause did not apply',
      );
      await page.waitFor(450);
      assert.ok(Math.abs((await state(hook)).time - paused.time) < 0.25);
      await action('play', hook);
      await until(
        () => state(hook),
        (s) => s.playing && s.time > paused.time + 0.3,
        'resume failed',
      );
      report.checks.push({
        scenario,
        src: first.src,
        bytes: first.bytes,
        duration: first.duration,
        progress: [first.time, later.time],
        passed: true,
      });
      console.log('PASS', scenario, first.src, first.time, '->', later.time);
    }
    const page = await app.reLaunch('/pages/video-group/index');
    const sources = [];
    for (const [index, id] of ['first', 'second', 'third'].entries()) {
      await app.pageScrollTo(index * 400);
      await page.waitFor(250);
      await action('play', false, id);
      const clip = await until(
        () => state(false, id),
        (s) => s.playing && s.time > 0.2,
        'group clip did not play',
      );
      assert.equal(clip.validPath, true);
      assert.equal(clip.duration, 12);
      sources.push(clip.src);
      await app.screenshot({
        path: `artifacts/media-verification/group-${id}-a.png`,
      });
      const progressed = await until(
        () => state(false, id),
        (s) => s.time > clip.time + 0.4,
        'group clip clock stalled',
      );
      await app.screenshot({
        path: `artifacts/media-verification/group-${id}-b.png`,
      });
      report.checks.push({
        scenario: 'video-group',
        id,
        src: clip.src,
        progress: [clip.time, progressed.time],
        passed: true,
      });
    }
    assert.equal(new Set(sources).size, 3);
    await action('onSoundToggle', false, 'second');
    await action('onSoundToggle', false, 'third');
    await page.waitFor(300);
    assert.deepEqual(
      await app.evaluate(function () {
        const p = getCurrentPages().slice(-1)[0];
        return ['first', 'second', 'third'].map(
          (id) => p.selectComponent('#' + id).data.soundOff,
        );
      }),
      [true, true, false],
    );
    await app.evaluate(function () {
      getCurrentPages().slice(-1)[0].muteAll();
      return true;
    });
    await app.screenshot({ path: 'artifacts/media-verification/group.png' });
  },
);
