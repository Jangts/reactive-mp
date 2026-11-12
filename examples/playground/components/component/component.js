/** 原生开发宿主的 component 场景，用于交互复现与核心包联调。 */
import {
  defineComponent,
  onMounted,
  onShow,
  ref,
  useSchedule,
  useSignal,
  watch,
  watchEffect,
} from '../../vendor/reactive-mp/src/index.js';

defineComponent({
  setup({ $this, provide, inject, defineProps, observe }) {
    const props = defineProps({
      propA: {
        type: String,
        value: '00000',
        observer(a, b) {
          console.log(2222, a);
        },
      },
      propB: Boolean,
      propC: {
        type: Number,
      },
    });
    const page = inject('page');
    const motto = inject('motto', 'replace1');
    const [aaaa, setAaaa] = useSignal({
      bbbb: {
        cccc: 'cccc',
      },
    });
    const [buttonName, setButtonName] = useSignal('Button');
    const buttonName2 = ref('Button');

    provide('propA', () => props.propA);
    provide('propB', () => props.propB);
    provide('propC', () => props.propC);

    watchEffect(() => {
      console.log('watchEffect->buttonName2', buttonName2.value);
    });

    watch(
      ['aaaa', props, buttonName, buttonName2, () => props.propA],
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );

    watch(
      [props, () => props.propB],
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      () => props.propC,
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      props,
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      buttonName2,
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      buttonName,
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      'buttonName',
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );
    watch(
      true,
      (v) => {
        console.log('watch(props)', v);
      },
      { immediate: true },
    );

    useSchedule(() => {
      setButtonName('Clickable');
      buttonName2.value = 'Clickable';
    }, 3000);

    onShow(() => {
      console.log('onShow');
    });

    onMounted(() => console.log('ParentMount'));

    const onChildMount = (e) => {
      console.log('onChildMount', e.detail);
      const child = $this.selectComponent('#test');
      console.log('ChildExportOrInstance', child);
      child.ffff('ffff');
    };

    return {
      aaaa,
      buttonName,
      buttonName2,
      onClick2(e) {
        console.log('setup onClick2', e, this);
      },
      onChildMount,
    };
  },

  methods: {
    onClick1(e) {
      console.log('observers methods onClick1', e, this);
      this.setData({
        'aaaa.bbbb.cccc': 'dddd',
      });
    },
    onClick2(e) {
      console.log('methods onClick2', e, this);
    },
  },
  observers: {
    aaaa(v) {
      console.log('observers aaaa', v);
    },
    'aaaa.bbbb'(v) {
      console.log('observers aaaa.bbbb', v);
    },
    'aaaa.bbbb.cccc'(v) {
      console.log('observers aaaa.bbbb.cccc', v);
    },
  },
});
