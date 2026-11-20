# Reactive MP Kit

WeChat API wrappers, image preloading and a shared Store entry for native Mini Programs. Applications own requests, authentication and visual structure.

| Task | Documentation |
| --- | --- |
| Login, routing, storage, files and native tasks | [WeChat APIs](wechat.md) |
| Request clients, error handling and concurrency | [Requests](wechat-network.md) |
| Batch image loading, shared requests and size lookup | [Images Preloader](images-preloader.md) |
| Cross-page state and resource cleanup | [Store forwarding](store.md) |

[Quick start](getting-started.md) covers archive installation and native preparation. [Guide](guide.md) explains entry selection. [API reference](api.md) contains root and sub-entry signatures.

Kit directly owns WeChat and Images Preloader. Store remains the independent @reactive-mp/store package; Kit forwards its interfaces and types.
