# Reactivity

A platform-independent state engine. Signals represent single values, computed derives state, watch/watchEffect connect effects, and effect scopes own subscriptions and cleanup. It does not depend on wx or register pages.

| Task | Capability |
| --- | --- |
| Read and update one value | useSignal |
| Derive state | computed |
| Organize object/value-shaped state | reactive, ref, mutable, signalized |
| React to changes | watch, watchEffect |
| Stop a group of resources | createEffectScope, onScopeDispose |

[Quick start](getting-started.md) runs in Node. [Guide](guide.md) covers scheduling, old values and lifetime. [API reference](api.md) includes every public sub-entry.
