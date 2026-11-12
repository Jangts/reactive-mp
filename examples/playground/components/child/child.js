/** 原生开发宿主的 child 场景，用于交互复现与核心包联调。 */
import {
  defineComponent,
  onMounted,
  onPageScroll,
  watch,
} from '../../vendor/reactive-mp/src/index.js';

defineComponent(({ $this, $emit, inject, defineExpose }) => {
  const motto = inject('motto', 'replace2');
  const propA = inject('propA', 'propAAAA');
  const none = inject('none', 'nulllll');

  defineExpose({
    aaaa: 'aaaa',
    bbbb: {},
    cccc: [],
    dddd: motto,
    eeee: 5,
    ffff: (...args) => {
      console.log('invoked expose method', args, none());
    },
    gggg: null,
  });

  watch([propA, none], ([p, n], [op, on]) => {
    console.log('watch providedData child: propA, none', [p, n], [op, on]);
  });
  watch(
    motto,
    (_, om) => {
      console.log('watch providedData child: motto', motto.value, om);
    },
    { immediate: true },
  );

  onMounted(() => {
    console.log('ChildMounted', propA());
    $emit('mounted', { me: $this });
  });
  onPageScroll((e) => {
    console.log('component onPageScroll', e);
  });
});
