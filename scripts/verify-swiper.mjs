/** 在实际微信模拟器验收轮播四场景、版式与媒体声音协调，并保存回执。 */
import assert from 'node:assert/strict';
import { runWechatVerification } from './lib/wechat-verification.mjs';
await runWechatVerification(
  { output: 'artifacts/swiper-live-verification.json' },
  async (app, report) => {
    const { checks, errors } = report;
    async function waitForState(getState, expected, label) {
      const deadline = Date.now() + 5000;
      let state;
      do {
        state = await getState();
        if (expected(state)) {
          return state;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } while (Date.now() < deadline);
      throw Error(`${label}: ${JSON.stringify(state)}`);
    }
    for (const scenario of [
      'swiper-native',
      'swiper-reactive',
      'swiper-hooks',
      'swiper-media',
    ]) {
      const page = await app.reLaunch(`/pages/${scenario}/index`);
      assert.ok(await page.$('.title'), `${scenario}: title missing`);
      if (scenario === 'swiper-native' || scenario === 'swiper-reactive') {
        const getState = () =>
          app.evaluate(function () {
            const c = getCurrentPages()
              .slice(-1)[0]
              .selectComponent('#gallery');
            return {
              current: c.data.swiperCurrent,
              applied: c.data.applied,
              count: c.data.count,
              options: c.data.renderOptions,
            };
          });
        await page.waitFor(600);
        let state = await getState();
        console.log(scenario, 'initial', JSON.stringify(state));
        assert.equal(state.current, 1);
        await app.evaluate(function () {
          getCurrentPages().slice(-1)[0].selectComponent('#gallery').next();
          return true;
        });
        state = await waitForState(
          getState,
          (state) => state.current === 2 && state.applied === 2,
          'programmatic swipe did not settle',
        );
        await app.evaluate(function () {
          getCurrentPages()
            .slice(-1)[0]
            .selectLayout({
              currentTarget: { dataset: { layout: 'coverflow' } },
            });
          return true;
        });
        await page.waitFor(500);
        state = await getState();
        assert.equal(state.options.rotate, 18);
        const gallery = await page.$('#gallery');
        const frames = await gallery.$$('.item-frame');
        const frameStyle = await frames[0].attribute('style');
        assert.ok(
          frameStyle && !frameStyle.includes('NaN'),
          'invalid motion style: ' + frameStyle,
        );
        const transforms = await gallery.$$('.item-transform');
        assert.notEqual(await transforms[0].style('transform'), 'none');
        await app.screenshot({ path: `artifacts/${scenario}-fixed.png` });
        await app.evaluate(function () {
          getCurrentPages().slice(-1)[0].toggleItems();
          return true;
        });
        state = await waitForState(
          getState,
          (state) => state.current === 0 && state.count === 1,
          'list shrink did not settle',
        );
      } else if (scenario === 'swiper-hooks') {
        assert.equal(await page.data('current'), 1);
        await app.evaluate(function () {
          getCurrentPages().slice(-1)[0].next();
          return true;
        });
        await page.waitFor(700);
        assert.equal(await page.data('current'), 2);
      } else {
        assert.equal((await page.$$('rmp-media-swiper')).length, 2);
        await app.evaluate(function () {
          ['first-gallery', 'second-gallery']
            .map((id) =>
              getCurrentPages()
                .slice(-1)[0]
                .selectComponent('#' + id),
            )
            .forEach((c) => c.to(1));
          return true;
        });
        await page.waitFor(1200);
        const media = await app.evaluate(function () {
          const page = getCurrentPages().slice(-1)[0];
          const swipers = ['first-gallery', 'second-gallery'].map((id) =>
            page.selectComponent('#' + id),
          );
          const videos = swipers.map((c) =>
            c
              .selectComponent('#swiper')
              .selectComponent('#item-1')
              ?.selectComponent('#video'),
          );
          if (videos.length !== 2 || videos.some((v) => !v)) {
            return { found: videos.map(Boolean) };
          }
          videos[0].onSoundToggle();
          videos[1].onSoundToggle();
          return {
            found: videos.map(Boolean),
            playing: videos.map((video) => video.data.isPlaying),
          };
        });
        assert.deepEqual(media.found, [true, true]);
        assert.equal(media.playing[0], true, 'active video did not start');
        await page.waitFor(400);
        const muted = await app.evaluate(function () {
          return ['first-gallery', 'second-gallery']
            .map((id) =>
              getCurrentPages()
                .slice(-1)[0]
                .selectComponent('#' + id),
            )
            .map(
              (c) =>
                c
                  .selectComponent('#swiper')
                  .selectComponent('#item-1')
                  .selectComponent('#video').data.soundOff,
            );
        });
        assert.deepEqual(muted, [true, false]);
        for (const [field, expected] of [
          ['media', [false, true]],
          ['secondaryMedia', [true, false]],
        ]) {
          await app.evaluate(function (field) {
            const page = getCurrentPages().slice(-1)[0];
            page.setData({
              [field]: page.data[field].map((item) => ({
                ...item,
                muted: false,
              })),
            });
            return true;
          }, field);
          await waitForState(
            () =>
              app.evaluate(function () {
                const page = getCurrentPages().slice(-1)[0];
                return ['first-gallery', 'second-gallery'].map(
                  (id) =>
                    page
                      .selectComponent('#' + id)
                      .selectComponent('#swiper')
                      .selectComponent('#item-1')
                      .selectComponent('#video').data.soundOff,
                );
              }),
            (value) => value.every((muted, index) => muted === expected[index]),
            'configured sound request bypassed group',
          );
        }
        await app.evaluate(function () {
          getCurrentPages().slice(-1)[0].muteAll();
          return true;
        });
        await app.screenshot({ path: 'artifacts/swiper-media-fixed.png' });
      }
      checks.push({ scenario, passed: true });
      console.log('PASS', scenario);
    }
    assert.equal(errors.length, 0, JSON.stringify(errors));
    await app.reLaunch('/pages/swiper-reactive/index');
  },
);
