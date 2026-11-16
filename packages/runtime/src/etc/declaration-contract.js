/** 注册结构合同：比较声明形状和固定配置，允许实例值与回调闭包变化。 */
import { isSignal } from '@reactive-mp/reactivity';

/** 用结构描述函数；构造器、正则和 Behavior 身份另行保留。 */
function normalize(value, seen = new Set()) {
  if (typeof value === 'function') {
    return [
      'function',
      [String, Number, Boolean, Object, Array, Function].indexOf(value),
    ];
  }
  if (value instanceof RegExp) {
    return ['regexp', value.source, value.flags];
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    throw new TypeError('declaration configuration must not be cyclic');
  }
  seen.add(value);
  const result = Array.isArray(value)
    ? value.map((item) => normalize(item, seen))
    : Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key], seen)]);
  seen.delete(value);
  return result;
}

export function captureDeclarationContract(ctx) {
  return {
    declarations: ctx.declarations.map(([kind, value]) => [
      kind,
      kind === 'behaviors' ? value : normalize(value),
    ]),
    returns: Object.entries(ctx.setupReturns)
      .map(([name, value]) => [
        name,
        typeof value === 'function' && !isSignal(value, true)
          ? 'method'
          : 'data',
      ])
      .sort(([a], [b]) => a.localeCompare(b)),
  };
}

export function assertDeclarationContract(expected, ctx) {
  const actual = captureDeclarationContract(ctx);
  const behaviors = (contract) =>
    contract.declarations
      .filter(([kind]) => kind === 'behaviors')
      .flatMap(([, refs]) => refs);
  const left = behaviors(expected),
    right = behaviors(actual);
  if (
    left.length !== right.length ||
    left.some((ref, i) => ref !== right[i]) ||
    JSON.stringify({
      ...expected,
      declarations: expected.declarations.filter(
        ([kind]) => kind !== 'behaviors',
      ),
    }) !==
      JSON.stringify({
        ...actual,
        declarations: actual.declarations.filter(
          ([kind]) => kind !== 'behaviors',
        ),
      })
  ) {
    throw new TypeError(
      'setup declaration structure differs from registration; keep declarations unconditional and vary instance values instead',
    );
  }
}
