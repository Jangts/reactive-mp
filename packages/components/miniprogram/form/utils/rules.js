/** 声明式规则目录与统一校验结果；每项约束独立执行一次。 */
export const ruleChecks = {
  required: (value, expected) => !expected || !empty(value),
  type: (value, expected) =>
    expected === 'array'
      ? Array.isArray(value)
      : expected === 'number'
        ? typeof value === 'number' && Number.isFinite(value)
        : expected === 'object'
          ? !!value && typeof value === 'object' && !Array.isArray(value)
          : typeof value === expected,
  accepted: (value, expected) => !expected || value === true,
  minLength: (value, expected) =>
    (typeof value === 'string' || Array.isArray(value)) &&
    Array.from(value).length >= expected,
  maxLength: (value, expected) =>
    (typeof value === 'string' || Array.isArray(value)) &&
    Array.from(value).length <= expected,
  min: (value, expected) =>
    typeof value === 'number' && Number.isFinite(value) && value >= expected,
  max: (value, expected) =>
    typeof value === 'number' && Number.isFinite(value) && value <= expected,
  pattern: (value, expected, rule) =>
    typeof value === 'string' && new RegExp(expected, rule.flags).test(value),
};
export function empty(value) {
  return (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  );
}
export function normalizeRules(rules = []) {
  return (Array.isArray(rules) ? rules : [rules]).map((rule) =>
    typeof rule === 'function' ? { validator: rule } : rule,
  );
}
export function matchesTrigger(rule, event, fallback = 'change') {
  if (!event) {
    return true;
  }
  const trigger = rule.trigger ?? fallback;
  return (Array.isArray(trigger) ? trigger : [trigger]).includes(event);
}
export async function runRule(rule, value, context, options = {}) {
  const message = (name) =>
    rule.message ??
    options.messages?.[name] ??
    `${context.label || context.path.join('.')}: ${name}`;
  for (const [name, check] of Object.entries(ruleChecks)) {
    if (
      rule[name] === undefined ||
      (empty(value) && !rule.required && name !== 'accepted')
    ) {
      continue;
    }
    if (!check(value, rule[name], rule)) {
      return { message: message(name), rule: name };
    }
  }
  if (rule.validator !== undefined) {
    const validator =
      typeof rule.validator === 'string'
        ? options.validators?.[rule.validator]
        : rule.validator;
    if (typeof validator !== 'function') {
      throw new TypeError(`Unknown validator: ${rule.validator}`);
    }
    const result = await validator(value, context);
    if (result !== true && result !== '') {
      return {
        message: typeof result === 'string' ? result : message('validator'),
        rule: 'validator',
      };
    }
  }
  return null;
}
