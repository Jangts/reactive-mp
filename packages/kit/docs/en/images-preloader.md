# Images Preloader

Hidden native image nodes wait for actual image results. The implementation provides ordered batches, in-flight sharing, timeout isolation, unmount cleanup and size lookup.

Ordinary Pages call loadImages on the native component. Reactive Pages may use the same component or useImagesPreloader with their own nodes. Shared logic owns requests and cleanup; applications decide what and when to preload.

A native WeChat host is required. Runtime/reactivity supply integration. Cached success is size metadata for this runtime, not persistent image-file storage.

[Integration](images-preloader-getting-started.md) includes JSON, WXML and JavaScript. [Guide](images-preloader-guide.md) covers cancellation, results and hooks. [API reference](api.md) contains signatures.
