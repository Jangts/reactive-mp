/** 在临时隔离消费者中安装真实 tarball，验证包体和导入。 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { workspacePackages } from './lib/workspace.mjs';
import { documentationPackages, sitePages } from '../apps/docs/navigation.mjs';
const exec = promisify(execFile);
const root = process.cwd(),
  temp = await mkdtemp(path.join(os.tmpdir(), 'reactive-mp-pack-'));
const env = {
  ...process.env,
  npm_config_cache: path.join(os.tmpdir(), 'reactive-mp-package-cache'),
};
try {
  const sites = await documentationPackages();
  const archives = [];
  for (const { folder: name, manifest } of await workspacePackages()) {
    const { stdout } = await exec(
      'npm',
      [
        'pack',
        `./packages/${name}`,
        '--json',
        '--pack-destination',
        temp,
        '--ignore-scripts',
      ],
      { cwd: root, env },
    );
    const [result] = JSON.parse(stdout);
    if (!result.files.some((file) => file.path === 'index.d.ts')) {
      throw Error(`${name}: missing declarations`);
    }
    const site = sites.find((item) => item.packageName === manifest.name);
    if (site) {
      const required = [
        'docs/site.json',
        ...Object.values(site.branding)
          .filter((source) => source.startsWith(site.packageRoot + '/'))
          .map((source) => path.posix.relative(site.packageRoot, source)),
        ...sitePages(site).map(([, , source]) =>
          path.posix.relative(site.packageRoot, source),
        ),
        ...sitePages(site).map(([, , source]) =>
          path.posix.relative(
            site.packageRoot,
            source.replace('/docs/', '/docs/en/'),
          ),
        ),
      ];
      for (const file of required) {
        if (!result.files.some((entry) => entry.path === file)) {
          throw Error(`${name}: missing package documentation ${file}`);
        }
      }
    }
    archives.push(path.join(temp, result.filename));
  }
  const consumer = path.join(temp, 'consumer');
  await mkdir(consumer);
  await writeFile(
    path.join(consumer, 'package.json'),
    '{"private":true,"type":"module"}',
  );
  await exec(
    'npm',
    [
      'install',
      '--offline',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      ...archives,
    ],
    { cwd: consumer, env },
  );
  await writeFile(
    path.join(consumer, 'verify.mjs'),
    `
    import assert from 'node:assert/strict';
    import { useSignal, computed, defineStore, defineComponent } from 'reactive-mp';
    const [n,set]=useSignal(1); const double=computed(()=>n()*2); set(3); assert.equal(double(),6);
    const use=defineStore('consumer',()=>({n})); assert.equal(use().n(),3); use.dispose();
    globalThis.Behavior=options=>options;
    globalThis.Component=options=>assert.equal(options.data.n,3);
    defineComponent(()=>({n}));
  `,
  );
  await exec(process.execPath, ['verify.mjs'], { cwd: consumer, env });
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
      import assert from 'node:assert/strict';
      import * as kit from '@reactive-mp/kit';
      import * as store from '@reactive-mp/store';
      import storeDefault from '@reactive-mp/kit/store';
      import {wxLogin, createRouter} from '@reactive-mp/kit/wechat/wx';
      import {createRequest} from '@reactive-mp/kit/wechat/network';
      assert.equal(kit.defineStore, store.defineStore);
      assert.equal(storeDefault, store.default);
      assert.equal(kit.wxLogin, wxLogin);
      for (const name of ['wechat','images-preloader']) {
        await assert.rejects(import('@reactive-mp/'+name), {code:'ERR_MODULE_NOT_FOUND'});
      }
      const result = await wxLogin();
      assert.equal(result[1].code, 'HOST_UNAVAILABLE');
      assert.equal(typeof createRouter().navigateTo, 'function');
      assert.equal(typeof createRequest().get, 'function');
    `,
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      'node_modules/reactive-mp/tools/prepare-native.mjs',
      '--out',
      './mini/kit',
      '--package',
      '@reactive-mp/kit',
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
      import assert from 'node:assert/strict';
      import {readdir} from 'node:fs/promises';
      import {wxRequest} from './mini/kit/kit/miniprogram/wechat/index.js';
      assert.deepEqual((await readdir('./mini/kit')).sort(), ['.reactive-mp-generated', 'kit', 'reactivity', 'runtime', 'shared', 'store']);
      const direct = await import('./mini/kit/store/src/index.js');
      const forwarded = await import('./mini/kit/kit/miniprogram/store.js');
      assert.equal(forwarded.defineStore, direct.defineStore);
      assert.equal(forwarded.default, direct.default);
      globalThis.wx = {request: ({success}) => success({statusCode: 200, data: 0})};
      assert.equal((await wxRequest('https://example.test'))[1].data, 0);
    `,
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      'node_modules/reactive-mp/tools/prepare-native.mjs',
      '--out',
      './mini/vendor',
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    const core = await import('./mini/vendor/reactive-mp/src/index.js');
    const [value, set] = core.useSignal(2);
    const double = core.computed(() => value() * 2);
    set(3);
    if (double() !== 6) throw Error('native package graph failed');
  `,
    ],
    { cwd: consumer, env },
  );
  const componentsManifest = JSON.parse(
    await readFile(
      path.join(consumer, 'node_modules/@reactive-mp/components/package.json'),
      'utf8',
    ),
  );
  for (const file of [
    'components/video/index.js',
    'components/video/index.json',
    'components/video/index.wxml',
    'components/video/index.wxss',
    'components/group/index.js',
    'components/group/index.json',
    'components/group/index.wxml',
    'utils/participant.js',
  ]) {
    await readFile(
      path.join(
        consumer,
        'node_modules/@reactive-mp/components',
        componentsManifest.miniprogram,
        'video',
        file,
      ),
    );
  }
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { createPlaybackController } from '@reactive-mp/components/video'; createPlaybackController().dispose();",
    ],
    { cwd: consumer, env },
  );
  for (const file of [
    'components/swiper/index.js',
    'components/swiper/index.json',
    'components/swiper/index.wxml',
    'components/swiper/index.wxss',
    'components/swiper/motion.wxs',
    'components/image-item/index.wxml',
    'components/media-item/index.json',
    'components/media-swiper/index.js',
    'components/media-swiper/index.json',
    'components/media-swiper/index.wxml',
  ]) {
    await readFile(
      path.join(
        consumer,
        'node_modules/@reactive-mp/components/miniprogram/swiper',
        file,
      ),
    );
  }
  const packageNames = (await workspacePackages()).map(
    (pkg) => pkg.manifest.name,
  );
  for (const extension of ['js', 'json', 'wxml', 'wxss']) {
    await readFile(
      path.join(
        consumer,
        `node_modules/@reactive-mp/kit/miniprogram/images-preloader/components/images-preloader/index.${extension}`,
      ),
    );
  }
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    import {useImagesPreloader, getLoadedImageSizeByUrl, clearImageCache} from '@reactive-mp/kit/images-preloader';
    assert.equal(typeof useImagesPreloader, 'function');
    clearImageCache();
    assert.deepEqual(getLoadedImageSizeByUrl('/missing.png'), {});
    globalThis.Behavior=options=>options;
    globalThis.Component=options=>assert.equal(typeof options.methods.loadImages, 'function');
    await import('@reactive-mp/kit/images-preloader/components/images-preloader/index.js');
  `,
    ],
    { cwd: consumer, env },
  );
  await writeFile(
    path.join(consumer, 'verify-swiper.mjs'),
    `
    import assert from 'node:assert/strict';
    import {readFile} from 'node:fs/promises';
    import path from 'node:path';
    import {fileURLToPath} from 'node:url';
    import {useSwiper, swiperLayouts} from '@reactive-mp/components/swiper';
    import {prepareNativeSources} from 'reactive-mp/native-tools';
    assert.equal(typeof useSwiper, 'function');
    assert.equal(swiperLayouts.focus.scale, 0.9);
    const packages = new Map();
    for (const name of ${JSON.stringify(packageNames)}) {
      const root = path.dirname(path.dirname(fileURLToPath(import.meta.resolve(name))));
      const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
      packages.set(name, {root, manifest, folder:name.split('/').at(-1)});
    }
    await prepareNativeSources('./mini/all', packages);
    const component = './mini/all/components/miniprogram/swiper/components/media-item/index.json';
    const config = JSON.parse(await readFile(component, 'utf8'));
    const target = path.resolve(path.dirname(component), config.usingComponents['rmp-video']);
    assert.equal(JSON.parse(await readFile(target + '.json', 'utf8')).component, true);
    await readFile('./mini/all/components/miniprogram/swiper/components/swiper/motion.wxs');
    const preloader = await import('./mini/all/kit/miniprogram/images-preloader/index.js');
    assert.equal(typeof preloader.useImagesPreloader, 'function');
    await readFile('./mini/all/kit/miniprogram/images-preloader/components/images-preloader/index.wxml');
  `,
  );
  await exec(process.execPath, ['verify-swiper.mjs'], { cwd: consumer, env });
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    import {readFile} from 'node:fs/promises';
    import {createFormController,validateValues,useField} from '@reactive-mp/components/form';
    assert.equal(typeof useField,'function');
    const form=createFormController({initialValues:{name:''}});
    form.registerField('name',{rules:[{required:true}]});
    assert.equal((await form.validate()).status,'invalid');
    form.setFieldValue('name','ok');assert.equal((await form.submit()).status,'submitted');form.dispose();
    assert.equal((await validateValues({n:0},{n:{required:true,type:'number'}})).status,'valid');
    for(const name of ['form','form-item','form-button','input','textarea','checkbox','switch','radio-group','checkbox-group','select','column-picker','date-picker','region-picker','cascader','calendar','upload']){
      for(const extension of ['js','json','wxml','wxss']){
        await readFile('node_modules/@reactive-mp/components/miniprogram/form/components/'+name+'/index.'+extension);
      }
    }
    const prepared=await import('./mini/all/components/miniprogram/form/index.js');
    assert.equal(typeof prepared.useForm,'function');
  `,
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      'node_modules/reactive-mp/tools/prepare-native.mjs',
      '--out',
      './mini/components',
      '--package',
      '@reactive-mp/components',
    ],
    { cwd: consumer, env },
  );
  await exec(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    import {readdir} from 'node:fs/promises';
    import * as components from '@reactive-mp/components';
    import * as form from '@reactive-mp/components/form';
    import * as video from '@reactive-mp/components/video';
    import * as swiper from '@reactive-mp/components/swiper';
    for (const domain of [form, video, swiper]) {
      for (const [name, value] of Object.entries(domain)) assert.equal(components[name], value);
    }
    for (const name of ['form','video','swiper']) {
      await assert.rejects(import('@reactive-mp/'+name), {code:'ERR_MODULE_NOT_FOUND'});
    }
    assert.deepEqual((await readdir('./mini/components')).sort(), ['.reactive-mp-generated','components','reactivity','runtime','shared']);
    const prepared = await import('./mini/components/components/miniprogram/index.js');
    const controller = prepared.createFormController({initialValues:{name:'ok'}});
    controller.registerField('name',{rules:[{required:true}]});
    assert.equal((await controller.validate()).status,'valid');
    controller.dispose();
    assert.equal(typeof prepared.useMediaSwiper,'function');
  `,
    ],
    { cwd: consumer, env },
  );
  await writeFile(
    path.join(consumer, 'components.ts'),
    `
    import {useForm,useVideo,useSwiper,type VideoProps} from '@reactive-mp/components';
    import {createFormController,type FormValues} from '@reactive-mp/components/form';
    import {createPlaybackController} from '@reactive-mp/components/video';
    import {swiperLayouts} from '@reactive-mp/components/swiper';
    const values:FormValues={name:'ok'};
    const props:VideoProps={src:'/demo.mp4'};
    createFormController({initialValues:values}).dispose();
    createPlaybackController().dispose();
    // @ts-expect-error source URLs are strings
    const invalid:VideoProps={src:1};
    void [useForm,useVideo,useSwiper,swiperLayouts,props,invalid];
  `,
  );
  await writeFile(
    path.join(consumer, 'kit.ts'),
    `
    import {defineStore,wxLogin,useImagesPreloader,type ImagesPreloadReport,type Result} from '@reactive-mp/kit';
    import storeDefault from '@reactive-mp/kit/store';
    import directStore from '@reactive-mp/store';
    import {createRequest} from '@reactive-mp/kit/wechat/network';
    const forwarded:typeof directStore=storeDefault;
    const login:Promise<Result<string>>=wxLogin();
    const loader=useImagesPreloader;
    const use=defineStore('consumer-kit',()=>({count:1}));
    const count:number=use().count;
    const report:ImagesPreloadReport={total:0,done:0,fail:0,results:[]};
    // @ts-expect-error report counters are numbers
    const invalid:ImagesPreloadReport={total:'0',done:0,fail:0,results:[]};
    void [forwarded,login,loader,count,report,invalid,createRequest];
  `,
  );
  await exec(
    process.execPath,
    [
      path.join(root, 'node_modules/typescript/bin/tsc'),
      '--strict',
      '--noEmit',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      'components.ts',
      'kit.ts',
    ],
    { cwd: consumer, env },
  );
  console.log(
    `${archives.length} packed packages installed and verified in an isolated offline consumer`,
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
