# Select

Choose mapped option values with a native picker or a confirmation popup.

## When to use

Use for longer option lists; use popup for multiple selections.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/select/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Select">
    <rmp-field options="{{options}}" presentation="native" />
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
/** Select documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: 'bj',
    },
    result: '',
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
      },
    ],
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
/** Select documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: 'bj',
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    options: [
      {
        label: 'Beijing',
        value: 'bj',
      },
      {
        label: 'Shanghai',
        value: 'sh',
      },
      {
        label: 'Guangzhou',
        value: 'gz',
      },
    ],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

Interact with this Select example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

presentation="native" uses a native single-choice picker. Combine presentation="popup" with multiple="{{true}}" for a confirmation popup: toggles edit a draft, and confirm commits it.

### Popup multiple selection

Initialize model.value to [] in Page, then replace the field. Cancel discards the draft.

```xml
<rmp-field options="{{options}}" presentation="popup" multiple="{{true}}" title="Choose cities" />
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| name | `unknown` | `""` | Field path; dot notation and array indices are supported |
| label | `string` | `""` | Field label used by validation and presentation |
| value | `unknown` | `null` | External synchronized value for a standalone field |
| defaultValue | `unknown` | `null` | Initial value for a standalone field |
| rules | `array` | `[]` | Field rules, merged with Form and FormItem rules |
| required | `boolean` | `false` | Mark as required and append a required rule; 0 and false still count as nonempty. |
| disabled | `boolean` | `false` | Disable interaction and exclude the field from validation |
| readonly | `boolean` | `false` | Prevent interaction while keeping validation active |
| active | `boolean` | `true` | Active validation field, or the active item for media renderers |
| preserve | `boolean` | `true` | Keep the model value after the field unmounts |
| validateOn | `string` | `""` | Override interaction validation; text defaults to blur, other fields to change |
| appearance | `string` | `"plain"` | Base appearance: plain, underline or outline |
| placeholder | `string` | `"请选择"` | Hint displayed before input or selection |
| options | `array` | `[]` | Options with label, value and optional disabled; nested arrays for columns |
| labelKey | `string` | `"label"` | Key used for option labels |
| valueKey | `string` | `"value"` | Key used for option values |
| childrenKey | `string` | `"children"` | Key used for nested tree options |
| variant | `string` | `"list"` | list or buttons; Upload uses its base layout class |
| collapseAfter | `number` | `0` | Collapse options beyond this positive count; 0 disables collapsing |
| columns | `number` | `1` | Number of columns in the option layout |
| presentation | `string` | `"native"` | native or popup; multiple selection requires popup |
| multiple | `boolean` | `false` | Allow multiple selection in the popup |
| title | `string` | `""` | Title text |

A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).

## Events

| Event | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}; Upload uses {value,path,source}. |
| open | Current value; close also includes reason. |
| close | Current value; close also includes reason. |
| cancel | Current value; close also includes reason. |

## Slots and styling

Available slots: `summary`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |

## FAQ and boundaries

Cancelling discards the draft. Multiple selection requires an array model. Single selection returns an option value; native wheel indices do not enter the model.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
