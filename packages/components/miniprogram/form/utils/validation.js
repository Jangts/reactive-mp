/** 无宿主的数据校验入口，复用字段规则引擎。 */
import { clone, getValue, toPath } from './value-path.js';
import { normalizeRules, runRule } from './rules.js';
export async function validateValues(values, rules = {}, options = {}) {
  const snapshot = clone(values);
  const errors = [];
  for (const [name, config] of Object.entries(rules)) {
    const path = toPath(name);
    for (const rule of normalizeRules(config)) {
      const error = await runRule(
        rule,
        getValue(snapshot, path),
        { path, label: '', values: clone(snapshot), isCurrent: () => true },
        options,
      );
      if (error) {
        errors.push({ ...error, path, source: 'rule' });
        break;
      }
    }
  }
  return {
    status: errors.length ? 'invalid' : 'valid',
    values: snapshot,
    errors,
  };
}
