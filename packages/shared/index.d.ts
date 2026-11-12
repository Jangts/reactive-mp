/** 包级公开类型合同；参数、只读及生命周期语义与同包实现保持一致。 */
export function isArray(value: unknown): value is unknown[];
export function isBoolean(value: unknown): value is boolean;
export function isConstructor(
  value: unknown,
): value is new (...args: any[]) => any;
export function isDimensionString(value: unknown): boolean;
export function isFloat(value: unknown): boolean;
export function isFloatString(value: unknown): boolean;
export function isFunction(value: unknown): value is (...args: any[]) => any;
export function isInteger(value: unknown): boolean;
export function isIntegerString(value: unknown): boolean;
export function isMap(value: unknown): boolean;
export function isMeasurable(value: unknown): boolean;
export function isNameLessFunction(value: unknown): boolean;
export function isNaturalNumber(value: unknown): boolean;
export function isNonEmptyArray(
  value: unknown,
): value is [unknown, ...unknown[]];
export function isNonEmptyObject(value: unknown): boolean;
export function isNonEmptyString(value: unknown): boolean;
export function isNonNullObject(value: unknown): value is object;
export function isNumber(value: unknown): value is number;
export function isNumeric(value: unknown): boolean;
export function isNumericString(value: unknown): boolean;
export function isObject(value: unknown): boolean;
export function isParamlessFunction(value: unknown): boolean;
export function isPercentageString(value: unknown): boolean;
export function isPlainObject(value: unknown): value is Record<string, unknown>;
export function isPositiveFloat(value: unknown): boolean;
export function isPositiveInteger(value: unknown): boolean;
export function isPositiveNumber(value: unknown): boolean;
export function isRegExp(value: unknown): boolean;
export function isSet(value: unknown): boolean;
export function isString(value: unknown): value is string;
export function isSymbol(value: unknown): value is symbol;
export function isWeakMap(value: unknown): boolean;
export function shortUUID(): string;
export function formatPositiveInteger(
  value: unknown,
  fallback?: number,
): number;
export function get(target: unknown, path: string): unknown;
export function hasOwnProp(target: object, property: PropertyKey): boolean;
export function scheduleMicrotask(task: () => void): void;
export function debounceMicrotask<A extends unknown[]>(
  fn: (...args: A) => void,
  onTrigger?: (...args: A) => void,
): (...args: A) => void;
export function onceInvokable<A extends unknown[], R>(
  fn: (...args: A) => R,
  message?: string,
): (...args: A) => R;
export function mergeCallbacks(
  callbacks: ((...args: any[]) => unknown)[],
  thisArg?: unknown,
  ...args: unknown[]
): (...args: unknown[]) => unknown;
export function mergeArrayOrderByExists<T>(
  existing: T[],
  incoming: T[],
  check?: (item: T) => boolean,
): T[];
export function mergeArrayOrderByNewCome<T>(
  existing: T[],
  incoming: T[],
  check?: (item: T) => boolean,
): T[];
export interface BusEvent<T = unknown> {
  type: string | symbol;
  payload: T;
  target?: unknown;
  timestamp?: number;
}
export class EventBus {
  constructor(withTimestamp?: boolean, shouldMatchWildcard?: boolean);
  on<T = unknown>(
    name: string | symbol,
    handle: (event: BusEvent<T>) => void,
  ): () => void;
  once<T = unknown>(
    name: string | symbol,
    handle: (event: BusEvent<T>) => void,
  ): () => void;
  emit<T = unknown>(name: string | symbol, payload?: T, target?: unknown): this;
  off(name: string | symbol, handle?: (...args: any[]) => void): this;
  offNamespace(namespace: string): this;
  clear(): this;
}
