/** 示例素材只在启动时写入沙盒；不把代码包路径当作 video 播放地址。 */
import { demoClips } from '../assets/video/clips.js';
export const demoPosters = demoClips.map((clip) => clip.poster);
export function prepareDemoMedia(api = wx) {
  const fs = api.getFileSystemManager();
  return demoClips.map(({ base64, filename, bytes, ...clip }) => {
    const src = `${api.env.USER_DATA_PATH}/${filename}`;
    let exists = false;
    try {
      exists = fs.statSync(src).size === bytes;
    } catch {
      /* Not cached yet. */
    }
    if (!exists) {
      fs.writeFileSync(src, base64, 'base64');
    }
    return { ...clip, src };
  });
}
export function formatSummary(name, detail) {
  return `${name}：${detail.reason}，播放 ${detail.duration.toFixed(2)} 秒，位置 ${detail.currentTime.toFixed(1)} 秒，结束=${detail.finished}`;
}
