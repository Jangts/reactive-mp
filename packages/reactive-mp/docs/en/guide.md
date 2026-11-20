# Reactivity and composition

## State and derived values

useSignal(value) returns a reader and setter: read count() and call setCount(value). computed(getter) tracks synchronously read state and updates its read-only result synchronously. Do not write state inside a computed getter.

reactive(object) handles nested objects and arrays and reuses the proxy identity for the same raw object. ref(value) exposes a value property. mutable(object) provides writable carriers and an assign function; signalized(object) provides read-only carriers and assign.

## Watchers and cleanup

watch accepts a Signal, getter, reactive object or multiple sources. The callback receives the latest and previous delivered values; changes in one microtask are coalesced. immediate initially receives undefined as its old value; once delivers once. The returned handle supports stop, pause and resume.

A watch callback may write back if it converges. A job running more than 100 times in a flush triggers loop protection. Computed getters still prohibit writes. watchEffect runs immediately and tracks synchronous reads, dropping old branch dependencies when branches change. Reads after await are outside that synchronous collection.

During configuration collection, watchers do not subscribe or execute callbacks. Stopping watch releases internal getter computations; a failing initial watchEffect releases dependencies already collected.

Instance watchers stop on destruction. createEffectScope normally belongs to its parent; true creates a detached scope that the caller must stop. scope.onDispose returns a function that unregisters cleanup without executing it. runInEffectFreeScope is an advanced adapter boundary without subscriptions.

## Lifecycle and native instances

onLoad, onReady and onShow retain native meanings. onMounted runs after page load or component attached; onUnmounted cleans up at unload/detached. onBeforeMounted participates in parent/child dependency connection. useCurrentInstance returns null during collection; useCurrentPage queries the containing page.

useSchedule(task, {interval,times,immediate}) starts after mounting and stops on destruction. times=0 means unlimited. The cancel function supports restart, which cannot restart a destroyed instance.

## Communication

Read properties through defineProps; $emit connects to native triggerEvent. provide/inject accept strings and Symbols and connect ancestor data at mounting. The default applies when no provider exists. observe combines native data paths and signals.

Callbacks requiring a native return value, including sharing callbacks, use the last registered Hook, then a setup-returned method, then a native handler. Their return values are not collected by broadcasting.

<<< examples/integration/components/probe/probe.js

Declare hooks synchronously inside setup. Declaration without an active context throws; instance queries instead return null when unavailable. Signal.value is read-only: write through the setter.
