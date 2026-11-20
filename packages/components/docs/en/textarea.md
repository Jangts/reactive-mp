# Textarea

Edit longer text with automatic height and an optional character counter.

## When to use

Use for descriptions or notes that need multiple lines.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/textarea/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Textarea">
    <rmp-field placeholder="Notes" maxlength="200" show-count="{{true}}" />
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
/** Textarea documentation demo: native Page event wiring. */
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
/** Textarea documentation demo: reactive composition page. */
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

Interact with this Textarea example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

autoHeight="{{true}}" grows with content; showCount="{{true}}" displays a counter. Set maxlength for a business limit and appearance="outline" for a base border.

### Bounded long text

Replace the basic field while retaining FormItem.

```xml
<rmp-field placeholder="Up to 500 characters" maxlength="500" auto-height="{{true}}" show-count="{{true}}" appearance="outline" />
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
| placeholder | `string` | `"请输入"` | Hint displayed before input or selection |
| type | `string` | `"text"` | Native input type, text by default |
| maxlength | `number` | `-1` | Maximum character count; -1 adds no limit |
| autoHeight | `boolean` | `true` | Let Textarea grow with its content |
| showCount | `boolean` | `false` | Show the Textarea character count |
| focus | `boolean` | `false` | Native focus state; actual behavior is platform-dependent |
| adjustPosition | `boolean` | `true` | Adjust the viewport when the keyboard opens |
| confirmType | `string` | `"done"` | Native keyboard confirmation button type |
| password | `boolean` | `false` | Use password input |

A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).

## Events

| Event | event.detail |
| --- | --- |
| change | {value,previousValue,path,source,...}; Upload uses {value,path,source}. |
| input | Preserves native detail and adds the field path. |
| focus | Preserves native detail and adds the field path. |
| blur | Preserves native detail and adds the field path. |
| confirm | Preserves native detail and adds the field path. |

## Slots and styling

This wrapper has no content slots. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |

## FAQ and boundaries

Do not let a fixed height compete with automatic height. Native textarea controls focus and keyboard adjustment; browser previews do not verify device keyboard behavior.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
