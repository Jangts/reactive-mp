# How it works

## Configuration collection

Native registration needs a stable set of properties, methods, lifecycle entries and relations. setup runs in an effect-free collection context to collect these declarations before an instance exists. Instance queries return null and managed watchers do not subscribe or run callbacks then.

Collection is not a sandbox or source parser: arbitrary JavaScript in setup still runs. Keep requests, timers and node operations in lifecycle hooks. Setup must return synchronously.

## Instance creation

Each native instance gets its own runtime context, signals and resource scope. Property carriers read actual instance properties, including values merged by native Behaviors. Parent/child relation markers connect providers and form/video participants without copying module identities.

## View synchronization

Returned signals and carriers connect to native data. Functions become methods. Reactive updates are batched for view delivery; native setData also synchronizes the logic state. Initial commits wait until the platform can accept them. Values crossing into the view must be serializable.

## Scope and destruction

A runtime context restores the active instance and effect scope around lifecycle and event handlers. Instance cleanup releases watchers, relations and pending resource ownership. A detached shared Store owns a different lifetime and requires explicit disposal when its application lifetime ends.

Use [native options](native-options.md) for merge precedence and [composition](guide.md) for ordinary application patterns.

## Registration structure consistency

Collection and instance setup must declare the same platform structure. Values and callback closures may vary; returned keys and data/method classification, properties, native-path observers, relations, options, Behavior identities, external classes, page roles and platform hooks must remain consistent. Put conditional business behavior inside callbacks rather than adding registration entries based on instance properties. A mismatch throws TypeError before binding and releases setup resources. Pure signal watchers, injection and instance cleanup are not platform registration entries.
