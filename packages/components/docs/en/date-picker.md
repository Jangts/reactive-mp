# DatePicker

Select a date or time through the native picker.

## When to use

Use for compact date/time input with explicit bounds.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/date-picker/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="DatePicker">
    <rmp-field mode="date" min="2026-01-01" max="2027-12-31" />
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
/** DatePicker documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: '2026-11-18',
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
/** DatePicker documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: '2026-11-18',
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

Interact with this DatePicker example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

mode="date" uses YYYY-MM-DD; mode="time" uses HH:mm. Format min/max for the selected mode. fields controls date precision.

### Time selection

Set model.value to an HH:mm string such as 09:00, then use this field.

```xml
<rmp-field mode="time" min="09:00" max="18:00" default-picker-value="09:00" />
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| name | `unknown` | `""` | Field path; dot notation and array indices are supported |
| label | `string` | `""` | Field label used by validation and presentation |
| value | `unknown` | `null` | External synchronized value for a standalone field |
| defaultValue | `string` | `""` | Initial value for a standalone field |
| rules | `array` | `[]` | Field rules, merged with Form and FormItem rules |
| required | `boolean` | `false` | Mark as required and append a required rule; 0 and false still count as nonempty. |
| disabled | `boolean` | `false` | Disable interaction and exclude the field from validation |
| readonly | `boolean` | `false` | Prevent interaction while keeping validation active |
| active | `boolean` | `true` | Active validation field, or the active item for media renderers |
| preserve | `boolean` | `true` | Keep the model value after the field unmounts |
| validateOn | `string` | `""` | Override interaction validation; text defaults to blur, other fields to change |
| appearance | `string` | `"plain"` | Base appearance: plain, underline or outline |
| placeholder | `string` | `"请选择"` | Hint displayed before input or selection |
| mode | `string` | `"date"` | date or time |
| min | `string` | `""` | Earliest date or time, formatted for the selected mode |
| max | `string` | `""` | Latest date or time, formatted for the selected mode |
| fields | `string` | `"day"` | Native date precision: year, month or day |
| defaultPickerValue | `string` | `""` | Initial picker position when the model has no value |

A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).

## Events

| Event | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}; Upload uses {value,path,source}. |
| cancel | Native picker cancellation with the current value. |

## Slots and styling

This wrapper has no content slots. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |

## FAQ and boundaries

defaultPickerValue positions an empty picker but does not commit a value. Add validation rules for business requirements rather than relying only on picker bounds.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
