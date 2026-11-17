/** 两个媒体轮播共用声音分组，展示激活暂停和媒体事件转发。 */
import {
  definePage,
  useSignal,
  onLoad,
} from '../../vendor/reactive-mp/src/index.js';
import { useSwiperDemo } from '../../hooks/use-swiper-demo.js';
import { createSwiperDemoMedia } from '../../utils/swiper-demo.js';
import { prepareDemoMedia } from '../../utils/video-demo.js';
definePage(() => {
  const demo = useSwiperDemo();
  const [media, setMedia] = useSignal([]);
  const [secondaryMedia, setSecondaryMedia] = useSignal([]);
  onLoad(() => {
    try {
      const clips = prepareDemoMedia();
      setMedia(createSwiperDemoMedia(clips[0]));
      setSecondaryMedia(createSwiperDemoMedia(clips[1]));
    } catch (error) {
      demo.record('error', { message: error.message });
    }
  });
  return { ...demo, media, secondaryMedia };
});
