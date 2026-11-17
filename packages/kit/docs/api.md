# API 参考

公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。

## @reactive-mp/kit

[类型及完整签名](../index.d.ts) · [实现入口](../miniprogram/index.js)

| API | 类型签名 |
| --- | --- |
| NetworkError | `typeof import("./wechat/network.js").NetworkError` |
| WechatError | `typeof import("./wechat/result.js").WechatError` |
| clearImageCache | `(src?: string) => void` |
| createRequest | `<T = import("./wechat/wx.js").RequestResponse<unknown>>(baseURL?: string, options?: import("./wechat/network.js").CreateRequestOptions<T>) => import("./wechat/network.js").RequestClient<T>` |
| createRouter | `(options?: { tabRoutes?: readonly string[]; }) => import("./wechat/wx.js").Router` |
| debouncedGetter | `<A extends unknown[], T, E>(getter: import("./wechat/network.js").RemoteCaller<A, T, E>, strictMode?: boolean, options?: import("./wechat/network.js").RequestKeyOptions<A>) => (...args: A) => Promise<import("./wechat/result.js").Result<T, E \| import("./wechat/network.js").NetworkError>>` |
| debouncedSetter | `<A extends unknown[], T, E>(setter: import("./wechat/network.js").RemoteCaller<A, T, E>, withForce?: boolean) => ((...args: A) => Promise<import("./wechat/result.js").Result<T, E \| import("./wechat/network.js").NetworkError>>) & { force(...args: A): Promise<import("./wechat/result.js").Result<T, E \| import("./wechat/network.js").NetworkError>>; }` |
| defineStore | `<T extends object>(id: string, setup: () => T) => import("@reactive-mp/store").StoreDefinition<T>` |
| formatRoute | `(route: import("./wechat/wx.js").Route, tabRoutes?: readonly string[]) => import("./wechat/wx.js").FormattedRoute` |
| getLoadedImageSizeByUrl | `(src: string) => Partial<import("./images-preloader/index.js").ImageSize>` |
| getStorageItem | `<T = unknown>(key: string) => import("./wechat/result.js").Result<T>` |
| isNetReqErr | `(error: unknown) => error is import("./wechat/network.js").NetworkError` |
| isNetResErr | `(error: unknown) => error is import("./wechat/network.js").NetworkError` |
| isNetworkError | `(error: unknown) => error is import("./wechat/network.js").NetworkError` |
| requestSubscriptionsNotification | `(tmplId: string) => Promise<import("./wechat/result.js").Result<Record<string, string>>>` |
| reusableGetter | `<A extends unknown[], T, E>(getter: import("./wechat/network.js").RemoteCaller<A, T, E>, options?: import("./wechat/network.js").RequestKeyOptions<A>) => (...args: A) => Promise<import("./wechat/result.js").Result<T, E \| import("./wechat/network.js").NetworkError>>` |
| setStorageItem | `<T>(key: string, data: T) => import("./wechat/result.js").Result<T>` |
| showNetErrMsg | `(error: unknown, defaultMessage?: string) => Promise<import("./wechat/result.js").Result<{ errMsg: string; }>>` |
| showResponseErrMsg | `(error: unknown, defaultMessage?: string) => Promise<import("./wechat/result.js").Result<{ errMsg: string; } \| false>>` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends import("@reactive-mp/reactivity").Signal<unknown> \| import("@reactive-mp/reactivity").Ref<unknown> ? K : never; }[keyof T]>` |
| useImagesPreloader | `() => import("./images-preloader/index.js").ImagesPreloaderHook` |
| wrapNetworkError | `(error: unknown, tag?: import("./wechat/network.js").NetworkErrorTag) => import("./wechat/network.js").NetworkError` |
| wxAuthorize | `(scope: string) => Promise<import("./wechat/result.js").Result<"">>` |
| wxCheckSubscriptionsSetting | `() => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").SubscriptionsSetting>>` |
| wxChooseImage | `(options?: { count?: number; sizeType?: ("original" \| "compressed")[]; sourceType?: ("album" \| "camera")[]; }) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").TempImageFile[]>>` |
| wxGetImageInfo | `(src: string) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").ImageInfo>>` |
| wxLogin | `(options?: { timeout?: number; }) => Promise<import("./wechat/result.js").Result<string>>` |
| wxNavigateBack | `(delta?: number) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").NavigationResponse>>` |
| wxNavigateTo | `(route: import("./wechat/wx.js").Route, events?: import("./wechat/wx.js").NavigationEvents) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").NavigationResponse>>` |
| wxQuerySelector | `(selector: string, context?: object) => import("./wechat/wx.js").NodesRef` |
| wxQuerySelectorAll | `(selector: string, context?: object) => import("./wechat/wx.js").NodesRef<import("./wechat/wx.js").BoundingClientRect[]>` |
| wxReLaunch | `(route: import("./wechat/wx.js").Route) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").NavigationResponse>>` |
| wxRedirectTo | `(route: import("./wechat/wx.js").Route) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").NavigationResponse>>` |
| wxRequest | `<T = unknown>(url: string, options?: import("./wechat/wx.js").RequestOptions) => import("./wechat/result.js").NativeCall<import("./wechat/wx.js").RequestResponse<T>, import("./wechat/result.js").RequestTask>` |
| wxSelect | `{ (selector: string, context: import("./wechat/wx.js").ComponentSelector): import("./wechat/wx.js").Selection; (selector: string, context?: object): Omit<import("./wechat/wx.js").Selection, "component">; }` |
| wxSelectAll | `(selector: string, context?: object) => { rects(): Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").BoundingClientRect[]>>; }` |
| wxSelectEvt | `<D extends object = Record<string, unknown>, S extends object = Record<string, unknown>>(event: { detail?: D; currentTarget?: { dataset?: S; }; }) => { detail(): D \| undefined; detail<K extends keyof D>(key: K): D[K] \| undefined; data(): Partial<S>; data<K extends keyof S>(key: K): S[K] \| undefined; }` |
| wxShowToast | `(options: string \| import("./wechat/wx.js").ToastOptions) => Promise<import("./wechat/result.js").Result<{ errMsg: string; }>>` |
| wxSwitchTab | `(route: import("./wechat/wx.js").Route) => Promise<import("./wechat/result.js").Result<import("./wechat/wx.js").NavigationResponse>>` |
| wxToastErrorMessage | `(error: unknown, defaultMessage?: string) => ReturnType<typeof import("./wechat/wx.js").wxShowToast>` |
| wxUploadFile | `<T = import("./wechat/wx.js").UploadResponse>(options: import("./wechat/wx.js").UploadOptions<T>) => import("./wechat/result.js").NativeCall<T, import("./wechat/result.js").UploadTask>` |

## @reactive-mp/kit/wechat

[类型及完整签名](../wechat/index.d.ts) · [实现入口](../miniprogram/wechat/index.js)

| API | 类型签名 |
| --- | --- |
| NetworkError | `typeof import("./network.js").NetworkError` |
| WechatError | `typeof import("./result.js").WechatError` |
| createRequest | `<T = import("./wx.js").RequestResponse<unknown>>(baseURL?: string, options?: import("./network.js").CreateRequestOptions<T>) => import("./network.js").RequestClient<T>` |
| createRouter | `(options?: { tabRoutes?: readonly string[]; }) => import("./wx.js").Router` |
| debouncedGetter | `<A extends unknown[], T, E>(getter: import("./network.js").RemoteCaller<A, T, E>, strictMode?: boolean, options?: import("./network.js").RequestKeyOptions<A>) => (...args: A) => Promise<import("./result.js").Result<T, E \| import("./network.js").NetworkError>>` |
| debouncedSetter | `<A extends unknown[], T, E>(setter: import("./network.js").RemoteCaller<A, T, E>, withForce?: boolean) => ((...args: A) => Promise<import("./result.js").Result<T, E \| import("./network.js").NetworkError>>) & { force(...args: A): Promise<import("./result.js").Result<T, E \| import("./network.js").NetworkError>>; }` |
| formatRoute | `(route: import("./wx.js").Route, tabRoutes?: readonly string[]) => import("./wx.js").FormattedRoute` |
| getStorageItem | `<T = unknown>(key: string) => import("./result.js").Result<T>` |
| isNetReqErr | `(error: unknown) => error is import("./network.js").NetworkError` |
| isNetResErr | `(error: unknown) => error is import("./network.js").NetworkError` |
| isNetworkError | `(error: unknown) => error is import("./network.js").NetworkError` |
| requestSubscriptionsNotification | `(tmplId: string) => Promise<import("./result.js").Result<Record<string, string>>>` |
| reusableGetter | `<A extends unknown[], T, E>(getter: import("./network.js").RemoteCaller<A, T, E>, options?: import("./network.js").RequestKeyOptions<A>) => (...args: A) => Promise<import("./result.js").Result<T, E \| import("./network.js").NetworkError>>` |
| setStorageItem | `<T>(key: string, data: T) => import("./result.js").Result<T>` |
| showNetErrMsg | `(error: unknown, defaultMessage?: string) => Promise<import("./result.js").Result<{ errMsg: string; }>>` |
| showResponseErrMsg | `(error: unknown, defaultMessage?: string) => Promise<import("./result.js").Result<{ errMsg: string; } \| false>>` |
| wrapNetworkError | `(error: unknown, tag?: import("./network.js").NetworkErrorTag) => import("./network.js").NetworkError` |
| wxAuthorize | `(scope: string) => Promise<import("./result.js").Result<"">>` |
| wxCheckSubscriptionsSetting | `() => Promise<import("./result.js").Result<import("./wx.js").SubscriptionsSetting>>` |
| wxChooseImage | `(options?: { count?: number; sizeType?: ("original" \| "compressed")[]; sourceType?: ("album" \| "camera")[]; }) => Promise<import("./result.js").Result<import("./wx.js").TempImageFile[]>>` |
| wxGetImageInfo | `(src: string) => Promise<import("./result.js").Result<import("./wx.js").ImageInfo>>` |
| wxLogin | `(options?: { timeout?: number; }) => Promise<import("./result.js").Result<string>>` |
| wxNavigateBack | `(delta?: number) => Promise<import("./result.js").Result<import("./wx.js").NavigationResponse>>` |
| wxNavigateTo | `(route: import("./wx.js").Route, events?: import("./wx.js").NavigationEvents) => Promise<import("./result.js").Result<import("./wx.js").NavigationResponse>>` |
| wxQuerySelector | `(selector: string, context?: object) => import("./wx.js").NodesRef` |
| wxQuerySelectorAll | `(selector: string, context?: object) => import("./wx.js").NodesRef<import("./wx.js").BoundingClientRect[]>` |
| wxReLaunch | `(route: import("./wx.js").Route) => Promise<import("./result.js").Result<import("./wx.js").NavigationResponse>>` |
| wxRedirectTo | `(route: import("./wx.js").Route) => Promise<import("./result.js").Result<import("./wx.js").NavigationResponse>>` |
| wxRequest | `<T = unknown>(url: string, options?: import("./wx.js").RequestOptions) => import("./result.js").NativeCall<import("./wx.js").RequestResponse<T>, import("./result.js").RequestTask>` |
| wxSelect | `{ (selector: string, context: import("./wx.js").ComponentSelector): import("./wx.js").Selection; (selector: string, context?: object): Omit<import("./wx.js").Selection, "component">; }` |
| wxSelectAll | `(selector: string, context?: object) => { rects(): Promise<import("./result.js").Result<import("./wx.js").BoundingClientRect[]>>; }` |
| wxSelectEvt | `<D extends object = Record<string, unknown>, S extends object = Record<string, unknown>>(event: { detail?: D; currentTarget?: { dataset?: S; }; }) => { detail(): D \| undefined; detail<K extends keyof D>(key: K): D[K] \| undefined; data(): Partial<S>; data<K extends keyof S>(key: K): S[K] \| undefined; }` |
| wxShowToast | `(options: string \| import("./wx.js").ToastOptions) => Promise<import("./result.js").Result<{ errMsg: string; }>>` |
| wxSwitchTab | `(route: import("./wx.js").Route) => Promise<import("./result.js").Result<import("./wx.js").NavigationResponse>>` |
| wxToastErrorMessage | `(error: unknown, defaultMessage?: string) => ReturnType<typeof import("./wx.js").wxShowToast>` |
| wxUploadFile | `<T = import("./wx.js").UploadResponse>(options: import("./wx.js").UploadOptions<T>) => import("./result.js").NativeCall<T, import("./result.js").UploadTask>` |

## @reactive-mp/kit/wechat/wx

[类型及完整签名](../wechat/wx.d.ts) · [实现入口](../miniprogram/wechat/wx/index.js)

| API | 类型签名 |
| --- | --- |
| WechatError | `typeof import("./result.js").WechatError` |
| createRouter | `(options?: { tabRoutes?: readonly string[]; }) => Router` |
| formatRoute | `(route: Route, tabRoutes?: readonly string[]) => FormattedRoute` |
| getStorageItem | `<T = unknown>(key: string) => Result<T>` |
| requestSubscriptionsNotification | `(tmplId: string) => Promise<Result<Record<string, string>>>` |
| setStorageItem | `<T>(key: string, data: T) => Result<T>` |
| wxAuthorize | `(scope: string) => Promise<Result<"">>` |
| wxCheckSubscriptionsSetting | `() => Promise<Result<SubscriptionsSetting>>` |
| wxChooseImage | `(options?: { count?: number; sizeType?: ("original" \| "compressed")[]; sourceType?: ("album" \| "camera")[]; }) => Promise<Result<TempImageFile[]>>` |
| wxGetImageInfo | `(src: string) => Promise<Result<ImageInfo>>` |
| wxLogin | `(options?: { timeout?: number; }) => Promise<Result<string>>` |
| wxNavigateBack | `(delta?: number) => Promise<Result<NavigationResponse>>` |
| wxNavigateTo | `(route: Route, events?: NavigationEvents) => Promise<Result<NavigationResponse>>` |
| wxQuerySelector | `(selector: string, context?: object) => NodesRef` |
| wxQuerySelectorAll | `(selector: string, context?: object) => NodesRef<BoundingClientRect[]>` |
| wxReLaunch | `(route: Route) => Promise<Result<NavigationResponse>>` |
| wxRedirectTo | `(route: Route) => Promise<Result<NavigationResponse>>` |
| wxRequest | `<T = unknown>(url: string, options?: RequestOptions) => NativeCall<RequestResponse<T>, RequestTask>` |
| wxSelect | `{ (selector: string, context: ComponentSelector): Selection; (selector: string, context?: object): Omit<Selection, "component">; }` |
| wxSelectAll | `(selector: string, context?: object) => { rects(): Promise<Result<BoundingClientRect[]>>; }` |
| wxSelectEvt | `<D extends object = Record<string, unknown>, S extends object = Record<string, unknown>>(event: { detail?: D; currentTarget?: { dataset?: S; }; }) => { detail(): D \| undefined; detail<K extends keyof D>(key: K): D[K] \| undefined; data(): Partial<S>; data<K extends keyof S>(key: K): S[K] \| undefined; }` |
| wxShowToast | `(options: string \| ToastOptions) => Promise<Result<{ errMsg: string; }>>` |
| wxSwitchTab | `(route: Route) => Promise<Result<NavigationResponse>>` |
| wxToastErrorMessage | `(error: unknown, defaultMessage?: string) => ReturnType<typeof wxShowToast>` |
| wxUploadFile | `<T = UploadResponse>(options: UploadOptions<T>) => NativeCall<T, UploadTask>` |

## @reactive-mp/kit/wechat/network

[类型及完整签名](../wechat/network.d.ts) · [实现入口](../miniprogram/wechat/network/index.js)

| API | 类型签名 |
| --- | --- |
| NetworkError | `typeof NetworkError` |
| createRequest | `<T = RequestResponse<unknown>>(baseURL?: string, options?: CreateRequestOptions<T>) => RequestClient<T>` |
| debouncedGetter | `<A extends unknown[], T, E>(getter: RemoteCaller<A, T, E>, strictMode?: boolean, options?: RequestKeyOptions<A>) => (...args: A) => Promise<Result<T, E \| NetworkError>>` |
| debouncedSetter | `<A extends unknown[], T, E>(setter: RemoteCaller<A, T, E>, withForce?: boolean) => ((...args: A) => Promise<Result<T, E \| NetworkError>>) & { force(...args: A): Promise<Result<T, E \| NetworkError>>; }` |
| isNetReqErr | `(error: unknown) => error is NetworkError` |
| isNetResErr | `(error: unknown) => error is NetworkError` |
| isNetworkError | `(error: unknown) => error is NetworkError` |
| reusableGetter | `<A extends unknown[], T, E>(getter: RemoteCaller<A, T, E>, options?: RequestKeyOptions<A>) => (...args: A) => Promise<Result<T, E \| NetworkError>>` |
| showNetErrMsg | `(error: unknown, defaultMessage?: string) => Promise<Result<{ errMsg: string; }>>` |
| showResponseErrMsg | `(error: unknown, defaultMessage?: string) => Promise<Result<{ errMsg: string; } \| false>>` |
| wrapNetworkError | `(error: unknown, tag?: NetworkErrorTag) => NetworkError` |

## @reactive-mp/kit/images-preloader

[类型及完整签名](../images-preloader/index.d.ts) · [实现入口](../miniprogram/images-preloader/index.js)

| API | 类型签名 |
| --- | --- |
| clearImageCache | `(src?: string) => void` |
| getLoadedImageSizeByUrl | `(src: string) => Partial<ImageSize>` |
| useImagesPreloader | `() => ImagesPreloaderHook` |

## @reactive-mp/kit/store

[类型及完整签名](../store.d.ts) · [实现入口](../miniprogram/store.js)

| API | 类型签名 |
| --- | --- |
| default | `<T extends object>(id: string, setup: () => T) => import("@reactive-mp/store").StoreDefinition<T>` |
| defineStore | `<T extends object>(id: string, setup: () => T) => import("@reactive-mp/store").StoreDefinition<T>` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends import("@reactive-mp/reactivity").Signal<unknown> \| import("@reactive-mp/reactivity").Ref<unknown> ? K : never; }[keyof T]>` |

