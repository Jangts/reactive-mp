# API 参考

公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。

## @reactive-mp/wechat

[类型及完整签名](../index.d.ts) · [实现入口](../src/index.js)

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

## @reactive-mp/wechat/wx

[类型及完整签名](../wx.d.ts) · [实现入口](../src/wx/index.js)

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

## @reactive-mp/wechat/network

[类型及完整签名](../network.d.ts) · [实现入口](../src/network/index.js)

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

