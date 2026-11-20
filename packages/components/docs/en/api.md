# API reference

Public exports and their actual type signatures. Refer to the guides for parameters, defaults, lifecycle, and native bindings.

## @reactive-mp/components

[Types and complete signatures](../../index.d.ts) · [Implementation](../../miniprogram/index.js)

| API | Type signature |
| --- | --- |
| createFormController | `<T extends import("./form.js").FormValues = import("./form.js").FormValues>(props?: import("./form.js").FormProps<T>, options?: import("./form.js").FormOptions) => import("./form.js").FormController<T>` |
| createPlaybackController | `() => import("./video.js").PlaybackController` |
| swiperLayouts | `Readonly<Record<import("./swiper.js").SwiperLayout, import("./swiper.js").LayoutRule>>` |
| useCalendar | `(props?: import("./form.js").CalendarProps, options?: import("./form.js").FieldOptions & { disabledDate?: (date: string) => boolean; }) => import("./form.js").CalendarHook` |
| useCascader | `(props?: import("./form.js").ChoiceProps, options?: import("./form.js").FieldOptions) => import("./form.js").CascaderHook` |
| useChoice | `(props?: import("./form.js").ChoiceProps, options?: import("./form.js").FieldOptions & { multiple?: boolean; }) => import("./form.js").ChoiceHook` |
| useField | `<T = unknown>(props?: import("./form.js").FieldProps<T>, options?: import("./form.js").FieldOptions) => import("./form.js").FieldHook<T>` |
| useFieldArray | `<T = unknown>(form: import("./form.js").FormController, path: import("./form.js").FieldPath, options?: { itemKey?: string; }) => { rows: import("@reactive-mp/reactivity").Signal<import("./form.js").FieldArrayRow<T>[]>; append(value: T): void; remove(index: number): void; move(from: number, to: number): void; replace(values: T[]): void; }` |
| useForm | `<T extends import("./form.js").FormValues = import("./form.js").FormValues>(props?: import("./form.js").FormProps<T>, options?: import("./form.js").FormOptions) => import("./form.js").FormHook<T>` |
| useFormItem | `(props?: import("./form.js").FormItemProps) => { itemError: import("@reactive-mp/reactivity").Signal<string>; itemRequired: import("@reactive-mp/reactivity").Signal<boolean>; itemDisabled: import("@reactive-mp/reactivity").Signal<boolean>; }` |
| useMediaSwiper | `<T extends import("./swiper.js").SwiperMediaItem>(props: Readonly<import("./swiper.js").SwiperProps<T>>, options?: import("./swiper.js").UseSwiperOptions & { selector?: string; }) => import("./swiper.js").MediaSwiperHook<T>` |
| useSelect | `(props?: import("./form.js").SelectProps, options?: import("./form.js").FieldOptions & { kind?: "select" \| "column" \| "date" \| "region"; }) => import("./form.js").SelectHook` |
| useSwiper | `<T = unknown>(props?: Readonly<import("./swiper.js").SwiperProps<T>>, options?: import("./swiper.js").UseSwiperOptions) => import("./swiper.js").SwiperHook<T>` |
| useUpload | `(props?: import("./form.js").UploadProps, options?: import("./form.js").FieldOptions & { adapter?: import("./form.js").UploadAdapter; }) => import("./form.js").UploadHook` |
| useVideo | `(props?: Readonly<import("./video.js").VideoProps>, options?: import("./video.js").UseVideoOptions) => import("./video.js").VideoHook` |
| useVideoGroup | `() => import("./video.js").VideoGroupInstance & { memberCount: import("@reactive-mp/reactivity").Signal<number>; }` |
| useVideoParticipant | `(mute: () => void) => { mute(): void; activateSound(): void; }` |
| validateValues | `<T extends import("./form.js").FormValues>(values: T, rules?: Record<string, import("./form.js").RuleConfig>, options?: import("./form.js").FormOptions) => Promise<import("./form.js").ValidationResult<T>>` |

## @reactive-mp/components/form

[Types and complete signatures](../../form.d.ts) · [Implementation](../../miniprogram/form/index.js)

| API | Type signature |
| --- | --- |
| createFormController | `<T extends FormValues = FormValues>(props?: FormProps<T>, options?: FormOptions) => FormController<T>` |
| useCalendar | `(props?: CalendarProps, options?: FieldOptions & { disabledDate?: (date: string) => boolean; }) => CalendarHook` |
| useCascader | `(props?: ChoiceProps, options?: FieldOptions) => CascaderHook` |
| useChoice | `(props?: ChoiceProps, options?: FieldOptions & { multiple?: boolean; }) => ChoiceHook` |
| useField | `<T = unknown>(props?: FieldProps<T>, options?: FieldOptions) => FieldHook<T>` |
| useFieldArray | `<T = unknown>(form: FormController, path: FieldPath, options?: { itemKey?: string; }) => { rows: Signal<FieldArrayRow<T>[]>; append(value: T): void; remove(index: number): void; move(from: number, to: number): void; replace(values: T[]): void; }` |
| useForm | `<T extends FormValues = FormValues>(props?: FormProps<T>, options?: FormOptions) => FormHook<T>` |
| useFormItem | `(props?: FormItemProps) => { itemError: Signal<string>; itemRequired: Signal<boolean>; itemDisabled: Signal<boolean>; }` |
| useSelect | `(props?: SelectProps, options?: FieldOptions & { kind?: "select" \| "column" \| "date" \| "region"; }) => SelectHook` |
| useUpload | `(props?: UploadProps, options?: FieldOptions & { adapter?: UploadAdapter; }) => UploadHook` |
| validateValues | `<T extends FormValues>(values: T, rules?: Record<string, RuleConfig>, options?: FormOptions) => Promise<ValidationResult<T>>` |

## @reactive-mp/components/video

[Types and complete signatures](../../video.d.ts) · [Implementation](../../miniprogram/video/index.js)

| API | Type signature |
| --- | --- |
| createPlaybackController | `() => PlaybackController` |
| useVideo | `(props?: Readonly<VideoProps>, options?: UseVideoOptions) => VideoHook` |
| useVideoGroup | `() => VideoGroupInstance & { memberCount: Signal<number>; }` |
| useVideoParticipant | `(mute: () => void) => { mute(): void; activateSound(): void; }` |

## @reactive-mp/components/swiper

[Types and complete signatures](../../swiper.d.ts) · [Implementation](../../miniprogram/swiper/index.js)

| API | Type signature |
| --- | --- |
| swiperLayouts | `Readonly<Record<SwiperLayout, LayoutRule>>` |
| useMediaSwiper | `<T extends SwiperMediaItem>(props: Readonly<SwiperProps<T>>, options?: UseSwiperOptions & { selector?: string; }) => MediaSwiperHook<T>` |
| useSwiper | `<T = unknown>(props?: Readonly<SwiperProps<T>>, options?: UseSwiperOptions) => SwiperHook<T>` |

