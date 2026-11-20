# API reference

Public exports and their actual type signatures. Refer to the guides for parameters, defaults, lifecycle, and native bindings.

## @reactive-mp/store

[Types and complete signatures](../../index.d.ts) · [Implementation](../../src/index.js)

| API | Type signature |
| --- | --- |
| default | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| defineStore | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends Signal<unknown> \| Ref<unknown> ? K : never; }[keyof T]>` |

