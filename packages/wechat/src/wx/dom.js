/** 节点选择、矩形查询和事件读取；查询上下文显式传入，不保存页面引用。 */
import { getWechat, toWechatError, WechatError } from '../result.js';

/** 创建限定于调用方上下文的原生查询，返回原生 NodesRef。 */
export function wxQuerySelector(selector, context) {
  const query = getWechat().createSelectorQuery();
  return (context ? query.in(context) : query).select(selector);
}

/** 多节点查询与单节点查询使用相同的上下文规则。 */
export function wxQuerySelectorAll(selector, context) {
  const query = getWechat().createSelectorQuery();
  return (context ? query.in(context) : query).selectAll(selector);
}

/** 执行矩形查询；无单节点是失败，无匹配的多节点返回成功空数组。 */
function queryRect(selector, context, multiple) {
  return new Promise((resolve) => {
    try {
      const select = multiple ? wxQuerySelectorAll : wxQuerySelector;
      select(selector, context)
        .boundingClientRect((rect) => {
          if (rect != null) {
            resolve([true, rect]);
          } else {
            resolve([
              false,
              new WechatError(`Node not found: ${selector}`, {
                api: 'createSelectorQuery',
                code: 'NODE_NOT_FOUND',
              }),
            ]);
          }
        })
        .exec();
    } catch (error) {
      resolve([false, toWechatError(error, 'createSelectorQuery')]);
    }
  });
}

/** 选择组件、读取矩形或 dataset；组件查询要求页面或组件上下文。 */
export function wxSelect(selector, context) {
  return {
    component: () => context.selectComponent(selector),
    rect: () => queryRect(selector, context, false),
    async data(key) {
      const [ok, rect] = await queryRect(selector, context, false);
      if (!ok) {
        return [false, rect];
      }
      const data = rect.dataset ?? {};
      return [true, key === undefined ? data : data[key]];
    },
  };
}

/** 选择多个节点，返回按原生查询顺序排列的矩形。 */
export function wxSelectAll(selector, context) {
  return { rects: () => queryRect(selector, context, true) };
}

/** 不传 key 时读取完整 detail 或 currentTarget.dataset。 */
export function wxSelectEvt(event) {
  return {
    detail: (key) => (key === undefined ? event?.detail : event?.detail?.[key]),
    data: (key) =>
      key === undefined
        ? (event?.currentTarget?.dataset ?? {})
        : event?.currentTarget?.dataset?.[key],
  };
}
