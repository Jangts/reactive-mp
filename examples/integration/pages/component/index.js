import { defineComponentPage, useSignal, onLoad, onMounted, onUnload } from '../../vendor/reactive-mp/src/index.js';
defineComponentPage(({ defineProps }) => {
  const props = defineProps({ title: { type: String, value: 'Component 页面' } });
  const [phase, setPhase] = useSignal('created');
  onLoad(() => console.info('component-page load'));
  onMounted(() => setPhase('mounted'));
  onUnload(() => console.info('component-page unload'));
  return { title: props.title, phase };
});
