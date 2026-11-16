/** 注册前检查必需的 JavaScript 能力；基础库与设备支持另由平台回执确认。 */
const requiredFeatures = [
  'Proxy',
  'WeakMap',
  'WeakSet',
  'WeakRef',
  'Map',
  'Set',
  'Promise',
];

export function assertRuntimeEnvironment() {
  const missing = requiredFeatures.filter(
    (name) => typeof globalThis[name] !== 'function',
  );
  if (missing.length) {
    throw new Error(
      `Reactive MP requires JavaScript features: ${missing.join(', ')}`,
    );
  }
}
