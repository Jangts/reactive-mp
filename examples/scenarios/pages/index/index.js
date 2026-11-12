/** 所属模块的公开导出入口，复用原实现，不创建平行状态。 */
import {
  definePage,
  defineStore,
  useSignal,
  computed,
} from '../../vendor/reactive-mp/src/index.js';
const useCart = defineStore('cart', () => {
  const [quantity, setQuantity] = useSignal(0);
  const total = computed(() => quantity() * 18);
  return {
    quantity,
    total,
    add: () => setQuantity(quantity() + 1),
    reset: () => setQuantity(0),
  };
});
definePage(() => {
  const cart = useCart();
  return {
    quantity: cart.quantity,
    total: cart.total,
    add: cart.add,
    reset: cart.reset,
    openAgain: () => wx.navigateTo({ url: '/pages/index/index' }),
  };
});
