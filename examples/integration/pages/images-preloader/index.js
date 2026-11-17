/** 普通 Page 演示共享预加载、重复项统计、错误结果和已加载图片尺寸查询。 */
import {
  getLoadedImageSizeByUrl,
  clearImageCache,
} from '../../vendor/kit/miniprogram/images-preloader/index.js';

const cover = '/assets/video/orbit.jpg';

Page({
  data: { report: '', size: '', includeError: false, mounted: true },
  async preload() {
    const loader = this.selectComponent('#preloader');
    if (!loader) {
      return;
    }
    const urls = [cover, cover, '/assets/video/bounce.jpg', null];
    if (this.data.includeError) {
      urls.push('/assets/missing-preload-demo.jpg');
    }
    const report = await loader.loadImages(urls, { timeout: 3000 });
    if (this._unloaded) {
      return;
    }
    this.setData({
      report: JSON.stringify(report, null, 2),
      size: JSON.stringify(getLoadedImageSizeByUrl(cover)),
    });
  },
  toggleError() {
    this.setData({ includeError: !this.data.includeError });
  },
  toggleMount() {
    this.setData({ mounted: !this.data.mounted });
  },
  clearCache() {
    clearImageCache();
    this.setData({ report: '', size: '{}' });
  },
  onUnload() {
    this._unloaded = true;
  },
});
