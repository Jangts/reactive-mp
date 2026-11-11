import type { Signal, Ref } from '@reactive-mp/reactivity';
export type Store<T> = T & { readonly $id: string; $dispose(): void };
export interface StoreDefinition<T> { (): Store<T>; dispose(): void }
export function defineStore<T extends object>(id: string, setup: () => T): StoreDefinition<T>;
export function storeToRefs<T extends object>(store: T): Pick<T, { [K in keyof T]: T[K] extends Signal<unknown> | Ref<unknown> ? K : never }[keyof T]>;
export default defineStore;
