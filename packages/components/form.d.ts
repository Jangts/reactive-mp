/** 表单组件、控制器和 Hooks 的公开类型；视图状态与逻辑对象分开。 */
import type { Signal } from '@reactive-mp/reactivity';
export type FieldPath = string | readonly (string | number)[];
export type FormValues = Record<string, unknown>;
export type FormStatus = 'idle' | 'validating' | 'valid' | 'invalid';
export type ValidatorResult = boolean | string;
export interface ValidationContext {
  path: readonly (string | number)[];
  label: string;
  values: Readonly<FormValues>;
  isCurrent(): boolean;
}
export type Validator = (
  value: unknown,
  context: ValidationContext,
) => ValidatorResult | Promise<ValidatorResult>;
export interface Rule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  accepted?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  flags?: string;
  validator?: string | Validator;
  message?: string;
  trigger?: string | string[];
  dependencies?: string[];
  debounce?: number;
}
export type RuleConfig = Rule | Validator | readonly (Rule | Validator)[];
export interface FieldError {
  path: (string | number)[];
  message: string;
  source: 'rule' | 'external';
  rule?: string;
}
export interface ValidationResult<T = FormValues> {
  status: 'valid' | 'invalid' | 'superseded';
  values: T;
  errors: FieldError[];
}
export type SubmitResult<T = FormValues> =
  | {
      status: 'submitted' | 'invalid' | 'superseded';
      values: T;
      errors: FieldError[];
    }
  | { status: 'blocked'; reason: string };
export interface FormState<T = FormValues> {
  values: T;
  errors: FieldError[];
  status: FormStatus;
  valid: boolean;
  validating: boolean;
  pending: boolean;
  submitting: boolean;
  dirty: boolean;
  touched: boolean;
  canSubmit: boolean;
}
export interface FieldState<T = unknown> {
  path: (string | number)[];
  value: T;
  errors: FieldError[];
  errorMessage: string;
  status: FormStatus;
  dirty: boolean;
  touched: boolean;
  pending: boolean;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
}
export interface FormProps<T extends FormValues = FormValues> {
  model?: T | null;
  initialValues?: T;
  rules?: Record<string, RuleConfig>;
  disabled?: boolean;
  readonly?: boolean;
  submitting?: boolean;
  validateOnMount?: boolean;
}
export interface FormOptions {
  scope?: boolean;
  emit?: (name: string, detail: unknown) => void;
  validators?: Record<string, Validator>;
  messages?: Record<string, string>;
  uploadAdapters?: Record<string, UploadAdapter>;
}
export interface FieldProps<T = unknown> {
  name?: FieldPath;
  label?: string;
  value?: T;
  defaultValue?: T;
  rules?: RuleConfig;
  itemRules?: RuleConfig;
  disabled?: boolean;
  readonly?: boolean;
  active?: boolean;
  required?: boolean;
  preserve?: boolean;
  validateOn?: string;
  maxlength?: number;
  appearance?: 'plain' | 'underline' | 'outline';
}
export interface FieldLease {
  readonly path: (string | number)[];
  update(config: FieldProps): void;
  setPending(pending: boolean): void;
  touch(): void;
  unregister(options?: { remove?: boolean }): void;
}
export interface FormController<T extends FormValues = FormValues> {
  registerField(path: FieldPath, props?: FieldProps): FieldLease;
  getValues(): T;
  getState(): FormState<T>;
  getFieldState<V = unknown>(path: FieldPath): FieldState<V> | undefined;
  setFieldValue(path: FieldPath, value: unknown, source?: string): boolean;
  setValues(values: Partial<T>): boolean;
  syncModel(values: T | null | undefined): void;
  setFieldError(path: FieldPath, message: string | null): void;
  hideErrors(paths?: FieldPath[]): void;
  validate(options?: {
    paths?: FieldPath[];
    silent?: boolean;
  }): Promise<ValidationResult<T>>;
  validateField(
    path: FieldPath,
    options?: { event?: string; silent?: boolean },
  ): Promise<string>;
  submit(
    handler?: (values: T) => unknown | Promise<unknown>,
  ): Promise<SubmitResult<T>>;
  handleSubmit(
    handler: (values: T) => unknown | Promise<unknown>,
  ): () => Promise<SubmitResult<T>>;
  reset(values?: T): void;
  configure(props: Partial<FormProps<T>>): void;
  subscribe(listener: (state: FormState<T>) => void): () => void;
  onReset(listener: () => void): () => void;
  setValidators(validators: Record<string, Validator>): void;
  setMessages(messages: Record<string, string>): void;
  setUploadAdapters(adapters: Record<string, UploadAdapter>): void;
  getUploadAdapter(name: string): UploadAdapter | undefined;
  reorderArray(path: FieldPath, values: unknown[], indices: number[]): void;
  dispose(): void;
}
export type FormHook<T extends FormValues = FormValues> = FormController<T> & {
  [K in keyof FormState<T>]: Signal<FormState<T>[K]>;
} & { state: Signal<FormState<T>> };
export function createFormController<T extends FormValues = FormValues>(
  props?: FormProps<T>,
  options?: FormOptions,
): FormController<T>;
export function useForm<T extends FormValues = FormValues>(
  props?: FormProps<T>,
  options?: FormOptions,
): FormHook<T>;
export function validateValues<T extends FormValues>(
  values: T,
  rules?: Record<string, RuleConfig>,
  options?: FormOptions,
): Promise<ValidationResult<T>>;
export interface NativeFieldEvent {
  detail: { value?: unknown; [key: string]: unknown };
  currentTarget?: { dataset: Record<string, unknown> };
}
export interface FieldOptions extends FormOptions {
  form?: FormController;
  validateOn?: string;
  parse?: (value: unknown) => unknown;
  format?: (value: unknown) => unknown;
}
export interface FieldHook<T = unknown> {
  value: Signal<T>;
  fieldValue: Signal<T>;
  fieldDisabled: Signal<boolean>;
  fieldReadonly: Signal<boolean>;
  errorMessage: Signal<string>;
  errors: Signal<FieldError[]>;
  status: Signal<FormStatus>;
  dirty: Signal<boolean>;
  touched: Signal<boolean>;
  pending: Signal<boolean>;
  required: Signal<boolean>;
  readonly form: FormController;
  readonly path: FieldPath;
  commit(
    value: unknown,
    source?: string,
    detail?: Record<string, unknown>,
  ): boolean;
  emit(name: string, detail?: unknown): void;
  setPending(pending: boolean): void;
  setValidators(validators: Record<string, Validator>): void;
  setMessages(messages: Record<string, string>): void;
  onInput(event: NativeFieldEvent): unknown;
  onChange(event: NativeFieldEvent): void;
  onFocus(event: NativeFieldEvent): void;
  onBlur(event: NativeFieldEvent): void;
  onConfirm(event: NativeFieldEvent): void;
}
export function useField<T = unknown>(
  props?: FieldProps<T>,
  options?: FieldOptions,
): FieldHook<T>;
export interface FormItemProps extends FieldProps {
  required?: boolean;
  description?: string;
  help?: string;
  labelPlacement?: 'top' | 'left';
}
export function useFormItem(props?: FormItemProps): {
  itemError: Signal<string>;
  itemRequired: Signal<boolean>;
  itemDisabled: Signal<boolean>;
};
export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
  [key: string]: unknown;
}
export interface ChoiceProps extends FieldProps {
  options?: readonly (Option | string | number | Record<string, unknown>)[];
  labelKey?: string;
  valueKey?: string;
  childrenKey?: string;
  collapseAfter?: number;
}
export interface ChoiceView extends Option {
  index: number;
  checked: boolean;
}
export interface ChoiceHook extends FieldHook {
  expanded: Signal<boolean>;
  checked: Signal<boolean>;
  choices: Signal<ChoiceView[]>;
  visibleChoices: Signal<ChoiceView[]>;
  canExpand: Signal<boolean>;
  onToggle(): void;
  onChoose(event: NativeFieldEvent): void;
  toggleExpanded(): void;
}
export function useChoice(
  props?: ChoiceProps,
  options?: FieldOptions & { multiple?: boolean },
): ChoiceHook;
export interface SelectProps extends Omit<ChoiceProps, 'options'> {
  options?: readonly unknown[];
  multiple?: boolean;
  presentation?: 'native' | 'popup';
  defaultPickerValue?: string;
}
export interface SelectHook extends FieldHook {
  opened: Signal<boolean>;
  pickerValue: Signal<unknown>;
  pickerRange: Signal<unknown[]>;
  display: Signal<string>;
  popupOptions: Signal<ChoiceView[]>;
  open(): void;
  close(): void;
  confirm(): void;
  onDraft(event: NativeFieldEvent): void;
  onPickerCancel(): void;
  onPickerChange(event: NativeFieldEvent): void;
}
export function useSelect(
  props?: SelectProps,
  options?: FieldOptions & { kind?: 'select' | 'column' | 'date' | 'region' },
): SelectHook;
export interface CascaderHook extends FieldHook {
  opened: Signal<boolean>;
  display: Signal<string>;
  levels: Signal<string[]>;
  loading: Signal<boolean>;
  cascadeOptions: Signal<Option[]>;
  open(): void;
  close(): void;
  onLevel(event: NativeFieldEvent): void;
  onCascadeChoose(event: NativeFieldEvent): void;
}
export function useCascader(
  props?: ChoiceProps,
  options?: FieldOptions,
): CascaderHook;
export interface CalendarProps extends FieldProps<string> {
  month?: string;
  min?: string;
  max?: string;
  disabledDates?: string[];
  weekdays?: string[];
}
export interface CalendarDay {
  value: string;
  day: string | number;
  disabled?: boolean;
  selected?: boolean;
}
export interface CalendarHook extends FieldHook<string> {
  month: Signal<string>;
  days: Signal<CalendarDay[]>;
  weekdays: Signal<string[]>;
  previousMonth(): void;
  nextMonth(): void;
  onDay(event: NativeFieldEvent): void;
}
export function useCalendar(
  props?: CalendarProps,
  options?: FieldOptions & { disabledDate?: (date: string) => boolean },
): CalendarHook;
export interface FileValue {
  id: string;
  type: 'image' | 'video';
  name?: string;
  size?: number;
  url?: string;
  tempFilePath?: string;
  poster?: string;
}
export type UploadAdapter = (
  file: Readonly<FileValue>,
  context: { onProgress(percent: number): void },
) => { result: Promise<{ url: string; poster?: string }>; abort?(): void };
export interface UploadProps extends FieldProps<FileValue[]> {
  adapter?: string;
  accept?: ('image' | 'video')[];
  maxCount?: number;
  maxSize?: number;
  typeLimits?: Partial<
    Record<'image' | 'video', { maxCount?: number; maxSize?: number }>
  >;
  autoUpload?: boolean;
  retryCount?: number;
}
export interface UploadFile extends FileValue {
  status: 'selected' | 'uploading' | 'success' | 'error' | 'cancelled';
  progress?: number;
  message?: string;
  attempt?: number;
}
export interface UploadHook extends FieldHook<FileValue[]> {
  files: Signal<UploadFile[]>;
  choose(): Promise<void>;
  upload(): Promise<unknown[]>;
  retry(id: string): Promise<unknown>;
  remove(id: string): void;
  addFiles(files: (Omit<FileValue, 'id'> & { id?: string })[]): Promise<void>;
  setAdapter(adapter: UploadAdapter): void;
  onRemove(event: NativeFieldEvent): void;
  onRetry(event: NativeFieldEvent): void;
  onPreview(event: NativeFieldEvent): void;
}
export function useUpload(
  props?: UploadProps,
  options?: FieldOptions & { adapter?: UploadAdapter },
): UploadHook;
export interface FieldArrayRow<T = unknown> {
  key: string;
  index: number;
  path: (string | number)[];
  value: T;
}
export function useFieldArray<T = unknown>(
  form: FormController,
  path: FieldPath,
  options?: { itemKey?: string },
): {
  rows: Signal<FieldArrayRow<T>[]>;
  append(value: T): void;
  remove(index: number): void;
  move(from: number, to: number): void;
  replace(values: T[]): void;
};
