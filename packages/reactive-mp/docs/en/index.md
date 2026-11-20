# Reactive MP

Reactive composition for native WeChat Mini Programs. Keep JavaScript, WXML, WXSS and native registration while organizing state and reusable behavior with signals and hooks.

[Get started](getting-started.md) · [API reference](api.md)

## Native development, composed

| Task | Capability |
| --- | --- |
| Reactive state | Signals, computed values and watchers track reads automatically |
| Reusable behavior | Compose state, lifecycle, communication and cleanup inside setup |
| Gradual adoption | Combine existing Page/Component options with dynamic declarations |
| Shared state | Reuse a lazy Store across pages and components |

## Continue by task

- [Reactivity and composition](guide.md): state, watchers, lifecycle and communication.
- [Native options](native-options.md): merge static options with hooks.
- [Shared state](store.md): shared resources and their lifetime.
- [API reference](api.md): actual public exports and signatures.
- [How it works](setup-runtime.md): collection, instances and view synchronization.

The Reactivity section of this site documents the independent @reactive-mp/reactivity package. Optional headless form, video and swiper capabilities belong to @reactive-mp/components. WeChat APIs and image preloading are provided by @reactive-mp/kit.
