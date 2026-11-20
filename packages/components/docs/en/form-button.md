# FormButton

Submit or reset the nearest Form using its current pending and disabled state.

## When to use

Use inside Form instead of manually coordinating submit locks.

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
  <rmp-form-item name="value" label="FormButton">
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
/** FormButton documentation demo: native Page event wiring. */
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
/** FormButton documentation demo: reactive composition page. */
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

Interact with this FormButton example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

action="reset" restores the reset baseline. requireValid="{{true}}" requires an already valid state; combine it with Form validateOnMount or explicit silent validation.

### Require known validity

Place this inside the existing Form and set validate-on-mount="{{true}}" on Form.

```xml
<rmp-form-button require-valid="{{true}}">Submit when valid</rmp-form-button>
<rmp-form-button action="reset">Restore initial values</rmp-form-button>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| action | `string` | `"submit"` | submit or reset |
| disabled | `boolean` | `false` | Disable this button without changing other fields or their validation state. |
| requireValid | `boolean` | `false` | Allow submission only when Form is already known to be valid |


## Events

No additional custom events are declared by this wrapper.

## Slots and styling

Available slots: `default`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

No additional imperative methods are documented for this wrapper.

## FAQ and boundaries

By default, an unvalidated form may be submitted to reveal errors. The button needs a Form ancestor. It does not await a Promise returned by a submit event listener.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
