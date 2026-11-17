import { definePage } from 'reactive-mp';
import {
  useImagesPreloader, getLoadedImageSizeByUrl, clearImageCache,
  type ImagesPreloaderInstance, type ImagesPreloadReport,
} from '@reactive-mp/kit/images-preloader';

async function preload(component: ImagesPreloaderInstance) {
  const urls: readonly (string | null | false)[] = ['/a.png', null, false];
  const report: ImagesPreloadReport = await component.loadImages(urls, { delay: true, timeout: 3000 });
  for (const result of report.results) {
    if (result.status === 'loaded') {
      const width: number = result.width;
      console.log(width, result.height);
    }
    if (result.status === 'error') {
      const message: string = result.errMsg;
      console.log(message);
    }
  }
  // @ts-expect-error timeout is measured in milliseconds
  component.loadImages(urls, { timeout: '3000' });
  return report;
}
definePage(() => {
  const loader = useImagesPreloader();
  const jobs: { id: number; src: string }[] = loader.images();
  loader.onImageLoad({ currentTarget: { dataset: { id: 1 } }, detail: { width: 1, height: 1 } });
  loader.onImageError({ currentTarget: { dataset: { id: '1' } }, detail: {} });
  return { ...loader, start: () => preload(loader), count: jobs.length };
});
const width: number | undefined = getLoadedImageSizeByUrl('/a.png').width;
clearImageCache('/a.png'); clearImageCache();
console.log(width);
