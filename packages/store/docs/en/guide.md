# Shared scope and resource lifetime

Store depends on reactivity and shared helpers rather than wx or page lifetime. defineStore(id, setup) returns a lazy useStore. Its first normal invocation creates the shared instance; later calls reuse it. Separate definitions remain independent even if ids match.

During configuration collection, useStore creates only a temporary effect-free result. It does not subscribe managed watchers or initialize the shared instance early. The real Store scope is detached from individual pages.

## State and disposal

Store preserves signals/carriers instead of unwrapping them into plain values. storeToRefs selects reactive fields while methods remain on the Store. Call store.$dispose() or useStore.dispose() to stop effects and release the current singleton. A later call creates a new instance; old references no longer own active effects.

The runnable scenario host exercises sharing across two instances:

<<< examples/scenarios/pages/index/index.js

## Side effects and actions

Do not start requests or timers directly in Store setup: collection also executes it. Start application effects in actions or instance lifecycle hooks and register Store-owned cleanup with onScopeDispose.

Setup must synchronously return an object. Actions preserve their receiver, support class methods using private fields, and keep stable function identity. Cleanup failures still release the current singleton before propagating the original error.
