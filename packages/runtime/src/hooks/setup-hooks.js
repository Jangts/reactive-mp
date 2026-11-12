/** 可复用声明 Hook，调用当前宿主能力并保留返回值。 */
import { callSetupCapability } from './context.js';

/**
 * [ behaviors ] 混入通用行为
 *
 * @param {string | string[]} ids
 * @param {...(string | string[])} more
 */
export function behaviors(ids, ...more) {
  return callSetupCapability('behaviors', ids, ...more);
}

/**
 * [ extClasses ] 定义组件接受的外部样式类
 *
 * @param {string | string[]} attrs
 * @param {...(string | string[])} more
 */
export function extClasses(attrs, ...more) {
  return callSetupCapability('extClasses', attrs, ...more);
}

/**
 * [ inject ] 注入父组件或祖先组件提供的数据
 *
 * @template T
 * @param {string | symbol} key
 * @param {T} [defaultValue = undefined]
 * @returns {import('@reactive-mp/reactivity').ComputedSignal<T>}
 */
export function inject(key, defaultValue) {
  return callSetupCapability('inject', key, defaultValue);
}

/**
 * [ observe ] 观察组件、页面数据或 signal payload 的变化
 *
 * @template {readonly unknown[]} T
 * @param {T} source
 * @param {(...values: import('@reactive-mp/reactivity').WatchValues<T>)=>void} callback
 * @returns {() => void}
 */
export function observe(source, callback) {
  return callSetupCapability('observe', source, callback);
}

/**
 * [ provide ] 向子组件和后代组件提供数据
 *
 * @template T
 * @param {string | symbol} key
 * @param {T} data
 */
export function provide(key, data) {
  return callSetupCapability('provide', key, data);
}

/**
 * [ relation ] 定义组件间关系
 *
 * @param {string} id
 * @param {object} 合法原生关系描述，保留 target 与关系回调。 description
 */
export function relation(id, description) {
  return callSetupCapability('defineRelation', id, description);
}
