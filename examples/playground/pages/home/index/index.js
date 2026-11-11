import { definePage, onMounted, useSignal } from "../../../vendor/reactive-mp/src/index.js";
definePage(() => {
  const [name, setGreeting] = useSignal("");

  onMounted(() => {
    setGreeting("world");
  });
  return { name };
});
