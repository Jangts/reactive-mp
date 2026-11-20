# Calendar

Choose a YYYY-MM-DD date in an inline month grid.

## When to use

Use when surrounding dates should stay visible.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/calendar/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Calendar">
    <rmp-field month="2026-11" />
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
/** Calendar documentation demo: native Page event wiring. */
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
/** Calendar documentation demo: reactive composition page. */
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

Interact with this Calendar example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

month controls the visible month; min/max and disabledDates constrain dates. Replace the seven weekdays labels for localization.

### Constrain date selection

Replace the field. Without an explicit min, past dates are not disabled automatically.

```xml
<rmp-field month="2026-11" min="2026-11-01" max="2026-11-30" disabled-dates="{{disabledDates}}" />
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
| min | `string` | `""` | Earliest date or time, formatted for the selected mode |
| max | `string` | `""` | Latest date or time, formatted for the selected mode |
| month | `string` | `""` | Displayed month in YYYY-MM format |
| disabledDates | `array` | `[]` | Disabled dates in YYYY-MM-DD format |
| weekdays | `array` | `["日","一","二","三","四","五","六"]` | Seven weekday labels starting with Sunday |

A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).

## Events

| Event | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}; Upload uses {value,path,source}. |

## Slots and styling

This wrapper has no content slots. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |

## FAQ and boundaries

Past dates are not disabled automatically. Dates use YYYY-MM-DD strings; applications define range and timezone policies.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
