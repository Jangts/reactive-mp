# Store

Lazy shared state built on reactive effect scopes. Each defineStore definition owns one disposable shared instance. Callers reuse its state and actions, and destroying one page does not end its lifetime.

## Scope

Use Store independently in JavaScript or connect it to native WeChat pages. Dependencies are @reactive-mp/reactivity and @reactive-mp/shared; wx is not required. id labels a definition rather than merging same-named definitions through a global registry.

[Quick start](getting-started.md) provides a complete counter. [Guide](guide.md) explains lazy initialization, stable actions and disposal. [API reference](api.md) lists types. @reactive-mp/kit/store directly forwards this package; it retains its independent version and documentation.
