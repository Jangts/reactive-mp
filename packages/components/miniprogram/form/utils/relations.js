/** 原生关系通过共享 Behavior 身份连接投影插槽内字段；上下文不进入 data。 */
import {
  behaviors,
  relation,
  useCurrentInstance,
  onUnmounted,
} from '@reactive-mp/runtime';
import { useSignal } from '@reactive-mp/reactivity';
const markers = {};
const contexts = new WeakMap();
function marker(name) {
  if (!markers[name]) {
    markers[name] = Behavior({});
  }
  return markers[name];
}
export function useFormRelations(kind, context) {
  const instance = useCurrentInstance();
  const [form, setForm] = useSignal(null);
  const [item, setItem] = useSignal(null);
  behaviors(marker(kind));
  if (instance) {
    contexts.set(instance, context);
  }
  if (kind === 'form' || kind === 'item') {
    relation('form-fields', { type: 'descendant', target: marker('field') });
  }
  if (kind === 'form') {
    relation('form-items', { type: 'descendant', target: marker('item') });
  } else {
    const connect = (target) => setForm(contexts.get(target) ?? null);
    relation('form-root', {
      type: 'ancestor',
      target: marker('form'),
      linked: connect,
      linkChanged: connect,
      unlinked(target) {
        if (form() === contexts.get(target)) {
          setForm(null);
        }
      },
    });
  }
  if (kind === 'field') {
    const connect = (target) => setItem(contexts.get(target) ?? null);
    relation('form-item', {
      type: 'ancestor',
      target: marker('item'),
      linked: connect,
      linkChanged: connect,
      unlinked(target) {
        if (item() === contexts.get(target)) {
          setItem(null);
        }
      },
    });
  }
  onUnmounted(() => {
    if (instance) {
      contexts.delete(instance);
    }
  });
  return { form, item };
}
