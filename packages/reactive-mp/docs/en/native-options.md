# Native options and dynamic declarations

definePage and defineComponent accept a setup function plus native options, or an options object containing setup. Without setup, pass native options directly.

| Option | Merge contract |
| --- | --- |
| data / methods | Matching setup results win; signals/carriers become data and functions become methods |
| properties | Merge by key with defineProps taking precedence; defineProps() can read the static schema |
| options | Merge with defineOptions; dynamic keys win and unknown native keys pass through |
| behaviors | Preserve and deduplicate native identifiers or objects |
| externalClasses | Deduplicate with extClasses |
| relations | Merge by relation name; dynamic declarations win and invoke instance handlers |
| lifetimes / pageLifetimes | Compose native handlers and hooks under the instance scope |
| observers | Keep both native handlers and observe callbacks; property changes synchronize reactive state |
| export | defineExpose wins; otherwise preserve native export and required Behavior |
| Return-value callbacks | Hook, then setup-returned method, then native callback |

Repeated defineProps calls merge into the same instance carrier. Previously declared properties remain available to later declarations. Keep each property's configuration consistent between setup executions.

## Page and component roles

Use definePage for ordinary Pages and defineComponent for components. defineComponentPage registers a page with Component while retaining component capabilities. context.page(result) also marks page role. Native registration fixes the configuration shape: new WXML event entry points cannot be added after an instance appears.

Initial internal view writes wait until attached. Work requiring real view nodes belongs in the corresponding lifecycle, not in configuration collection.

## App and removal

defineApp accepts setup plus native options, or an options object containing setup. App setup runs once and returns synchronously. Native globalData and custom instance fields retain their locations; returned state joins globalData and returned functions become actions. subscribeGlobalData, pickGlobalData, mapGlobalData and dispatchAppAction reuse this state rather than creating another Store.

App hooks include onLaunch, onShow, onHide, onAppError, onPageNotFound, onUnhandledRejection and onThemeChange. Native handlers and hooks compose while preserving native this.

onBeforeDetach runs before node removal and stops view commits; detached still finishes resource cleanup. Avoid node-dependent work in removal or destruction. setData synchronizes logic and reactive data before its callback; that callback only indicates native rendering completion. pureDataPattern keeps matching fields in logic rather than initial view data. View data must be serializable: cycles and functions fail at the delivery boundary.

## Behavior properties

The platform merges Behavior properties. Instance defineProps() reads actual instance.properties, including inherited and filter-added properties. An internal wildcard observer synchronizes updates without reading private Behavior identifiers. Collection has no instance, so derived values using inherited properties must tolerate their absence then.

The integration host contains a native Behavior comparison, mixed Page and Component examples, and a completely ordinary Page. Native setData and reactive setters can coexist with clearly owned fields. The mixed examples retain native data, methods, ready/onLoad and property/event communication. Removing and rebuilding components creates fresh instance state and releases old subscriptions. These examples do not imply that every native lifecycle ordering or device behavior has been verified.
