# API 参考

公开接口与类型签名。参数、默认值、生命周期和原生映射见相应指南。

## @reactive-mp/store

[类型及完整签名](../index.d.ts) · [实现入口](../src/index.js)

| API | 类型签名 |
| --- | --- |
| default | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| defineStore | `<T extends object>(id: string, setup: () => T) => StoreDefinition<T>` |
| storeToRefs | `<T extends object>(store: T) => Pick<T, { [K in keyof T]: T[K] extends Signal<unknown> \| Ref<unknown> ? K : never; }[keyof T]>` |

