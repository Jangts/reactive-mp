# Form

Manage a model, field registration, validation and submit snapshots.

## When to use

Use when several inputs must share validation and one submit result.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/input/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Form">
    <rmp-field placeholder="Name" maxlength="40" appearance="outline" />
  </rmp-form-item>
  <rmp-form-button>Submit</rmp-form-button>
  <rmp-form-button action="reset">Reset</rmp-form-button>
</rmp-form>
<text>{{result}}</text>
```

### index.js

Use either script as index.js. Both use the same JSON and WXML above.

::: code-group

```js [Native configuration]
/** Form documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: '',
    },
    result: '',
  },
  onChange(event) {
    this.setData({ model: event.detail.values });
  },
  onSubmit(event) {
    this.setData({ result: JSON.stringify(event.detail.values) });
  },
});
```

```js [Reactive composition]
/** Form documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: '',
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

Interact with this Form example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

Synchronize model from event.detail.values in change. initialValues establishes the reset baseline; reset(values) loads a record and establishes a new baseline.

### Register an asynchronous rule

Register the function in Page onReady, reference its name from rules in data, and add rules="{{rules}}" to the basic Form.

```js
onReady() {
  this.selectComponent('#form').setValidators({
    unique: async value => value === 'reserved' ? 'This name is reserved' : true,
  });
  this.setData({ rules: { value: [{ validator: 'unique' }] } });
}
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| model | `object` | `null` | External model snapshot; equal write-backs do not emit again |
| initialValues | `object` | `{}` | Initial values and the reset baseline |
| rules | `object` | `{}` | Map field paths to validation rules, merged with FormItem and field rules. |
| disabled | `boolean` | `false` | Disable interaction and exclude the field from validation |
| readonly | `boolean` | `false` | Prevent interaction while keeping validation active |
| submitting | `boolean` | `false` | Application request state, synchronized by an ordinary Page |
| validateOnMount | `boolean` | `false` | Run initial validation when mounted |


## Events

| Event | event.detail |
| --- | --- |
| change | {values,path?,value?,previousValue?,source}. |
| statechange | FormState snapshot. |
| validate | {status,values,errors}. |
| submit | {values}, only after successful validation. |
| invalid | {status,values,errors,firstErrorPath}. |
| reset | {values}, the restored model. |
| error | {type,message,...}, an operation failure. |

## Slots and styling

Available slots: `default`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `getValues()` | Read a plain-data model snapshot. |
| `getFieldState(path)` | Read a field value, errors, validation and interaction state. |
| `setFieldValue(path,value)` | Update a nested field and its dependencies/validation. |
| `setValues(values)` | Merge top-level keys without replacing the reset baseline. |
| `setFieldError(path,message)` | Set an external error; message=null clears it. |
| `hideErrors()` | Hide feedback without changing validity. |
| `validate(options?)` | Return Promise<{status,values,errors}>; options include paths and silent. |
| `submit()` | Validate immediately and submit; invalid emits on failure. Returns a result Promise. |
| `reset(values?)` | Restore the baseline, or load values and establish a new baseline. |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |
| `setUploadAdapters(registry)` | Register named adapters referenced by the Upload adapter property. |

## FAQ and boundaries

Only one field may own a path. A superseded asynchronous validation belongs to an outdated snapshot and is not a valid result. Application requests remain external; ordinary Pages must synchronize submitting.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
