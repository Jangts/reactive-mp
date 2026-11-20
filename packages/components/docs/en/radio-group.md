# RadioGroup

Choose one scalar value from visible options.

## When to use

Use when alternatives should remain visible.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/radio-group/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="RadioGroup">
    <rmp-field options="{{options}}" variant="buttons" />
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
/** RadioGroup documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: 0,
    },
    result: '',
    options: [
      {
        label: 'Beijing',
        value: 0,
      },
      {
        label: 'Shanghai',
        value: 1,
      },
      {
        label: 'Guangzhou',
        value: 2,
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
/** RadioGroup documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: 0,
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    options: [
      {
        label: 'Beijing',
        value: 0,
      },
      {
        label: 'Shanghai',
        value: 1,
      },
      {
        label: 'Guangzhou',
        value: 2,
      },
    ],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

Interact with this RadioGroup example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

Use {label,value,disabled?} options; 0 is a valid option value. variant="buttons" selects the button layout, and collapseAfter collapses long lists.

### Buttons or a collapsed list

Reuse options from the basic example and choose one presentation.

```xml
<rmp-field options="{{options}}" variant="buttons" />
<!-- Or: variant="list" collapse-after="2" -->
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

The model stores the option value rather than its index. labelKey/valueKey map business data, and disabled options cannot be selected.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
