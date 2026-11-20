# FormItem

Connect a named field to Form and render its label, help and validation feedback.

## When to use

Use around one logical field; an object-valued custom control still owns one path.

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
  <rmp-form-item name="value" label="Name" help="Shown below the input" label-placement="left">
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
/** FormItem documentation demo: native Page event wiring. */
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
/** FormItem documentation demo: reactive composition page. */
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

Interact with this FormItem example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

Use name to connect the inner field to the model. labelPlacement="left" places the label beside the field. Compose label, description, suffix, help and error slots as needed.

### Custom label and suffix

Replace the basic FormItem and keep its text label empty.

```xml
<rmp-form-item name="value" label="" label-placement="left">
  <text slot="label">Display name</text>
  <rmp-field placeholder="Name" />
  <text slot="suffix">Optional</text>
</rmp-form-item>
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| name | `unknown` | `""` | Field path; dot notation and array indices are supported |
| label | `string` | `""` | Field label used by validation and presentation |
| rules | `array` | `[]` | Field rules, merged with Form and FormItem rules |
| disabled | `boolean` | `false` | Disable interaction and exclude the field from validation |
| readonly | `boolean` | `false` | Prevent interaction while keeping validation active |
| active | `boolean` | `true` | Active validation field, or the active item for media renderers |
| required | `boolean` | `false` | Mark as required and append a required rule; 0 and false still count as nonempty. |
| description | `string` | `""` | Supporting description |
| help | `string` | `""` | Help text displayed when no error is visible |
| labelPlacement | `string` | `"top"` | Label placement: top or left |


## Events

No additional custom events are declared by this wrapper.

## Slots and styling

Available slots: `label`, `label-extra`, `description`, `default`, `suffix`, `error`, `help`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

No additional imperative methods are documented for this wrapper.

## FAQ and boundaries

Clear the matching text property when supplying label, description or help slots. A composite field should register one object value rather than let several fields own the same path.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
