# Upload

Select image/video files and coordinate upload tasks through an application adapter.

## When to use

Use when files belong to a form and unfinished uploads must block submission.

## Basic example

Complete files for a native Mini Program page. Prepare vendor dependencies as described in [Quick start](getting-started.md), register this page in app.json, and supply any media assets referenced below.

### index.json

```json
{
  "usingComponents": {
    "rmp-form": "/vendor/components/miniprogram/form/components/form/index",
    "rmp-form-item": "/vendor/components/miniprogram/form/components/form-item/index",
    "rmp-form-button": "/vendor/components/miniprogram/form/components/form-button/index",
    "rmp-field": "/vendor/components/miniprogram/form/components/upload/index"
  }
}
```

### index.wxml

```xml
<rmp-form id="form" model="{{model}}" bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="value" label="Upload">
    <rmp-field max-count="3" accept="{{accept}}" />
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
/** Upload documentation demo: native Page event wiring. */
Page({
  data: {
    model: {
      value: [],
    },
    result: '',
    accept: ['image'],
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
/** Upload documentation demo: reactive composition page. */
import { definePage } from '../../vendor/runtime/src/index.js';
import { useSignal } from '../../vendor/reactivity/src/index.js';

definePage(() => {
  const [model, setModel] = useSignal({
    value: [],
  });
  const [result, setResult] = useSignal('');

  return {
    model,
    result,
    accept: ['image'],
    onChange: (event) => setModel(event.detail.values),
    onSubmit: (event) => setResult(JSON.stringify(event.detail.values)),
  };
});
```

:::

Interact with this Upload example. Edit the field and choose Submit to display the submitted model; Reset restores initial values.

## Usage patterns

Without an adapter, Upload only selects local files. Register a named adapter with Form.setUploadAdapters, or call setAdapter on a standalone Upload. An adapter returns {result,abort?} and reports progress through onProgress.

### Start uploads manually

Add id="upload" and auto-upload="{{false}}" to the field. Register an adapter in Page onReady; Form-connected fields may also resolve a named Form adapter.

```js
onReady() {
  const upload = this.selectComponent('#upload');
  upload.setAdapter((file, { onProgress }) => {
    let task;
    const result = new Promise((resolve, reject) => {
      task = wx.uploadFile({ url: 'https://your-upload-domain.example/upload',
        filePath: file.tempFilePath, name: 'file',
        success: response => {
          try { resolve({ url: JSON.parse(response.data).url }); } catch (error) { reject(error); }
        }, fail: reject });
      task.onProgressUpdate(event => onProgress(event.progress));
    });
    return { result, abort: () => task.abort() };
  });
}
// In another Page handler: this.selectComponent('#upload').upload();
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| name | `unknown` | `""` | Field path; dot notation and array indices are supported |
| label | `string` | `""` | Field label used by validation and presentation |
| value | `unknown` | `null` | External synchronized value for a standalone field |
| defaultValue | `array` | `[]` | Initial value for a standalone field |
| rules | `array` | `[]` | Field rules, merged with Form and FormItem rules |
| required | `boolean` | `false` | Mark as required and append a required rule; 0 and false still count as nonempty. |
| disabled | `boolean` | `false` | Disable interaction and exclude the field from validation |
| readonly | `boolean` | `false` | Prevent interaction while keeping validation active |
| active | `boolean` | `true` | Active validation field, or the active item for media renderers |
| preserve | `boolean` | `true` | Keep the model value after the field unmounts |
| validateOn | `string` | `""` | Override interaction validation; text defaults to blur, other fields to change |
| appearance | `string` | `"plain"` | Base appearance: plain, underline or outline |
| placeholder | `string` | `"请选择"` | Hint displayed before input or selection |
| accept | `array` | `["image"]` | Allowed media types: image and video |
| adapter | `string` | `""` | Name of an upload adapter registered on Form |
| maxCount | `number` | `9` | Maximum total file count |
| maxSize | `number` | `0` | File size limit in bytes; 0 adds no limit |
| typeLimits | `object` | `{}` | Per-type image/video count and size limits |
| autoUpload | `boolean` | `true` | Start the adapter immediately after selection |
| retryCount | `number` | `0` | Number of automatic retries after a failure |
| title | `string` | `""` | Title text |
| description | `string` | `""` | Supporting description |

A field connected to Form reads its value from the form model. Use value/defaultValue only for standalone fields. Readonly fields remain part of validation; disabled and inactive fields do not. See [Models and validation](form-guide.md).

## Events

| Event | event.detail |
| --- | --- |
| change | {value,path,source}. |
| select | {file}. |
| uploadstart | {file,attempt}. |
| progress | {id,progress}, with percentage progress. |
| uploadsuccess | {file}. |
| uploaderror | {file,message}. |
| remove | {id}. |
| preview | {file}; the application decides how to preview. |
| error | {type:"selection",message}, native selection failure. |

## Slots and styling

Available slots: `add`. See [Styling and slots](styling.md) for the actual CSS variables, external classes, and layout responsibilities.

## Instance methods

Obtain the native instance with this.selectComponent(selector) after onReady.

| Method | Contract |
| --- | --- |
| `setValidators(registry)` | Register functions referenced by named rules without passing functions through WXML. |
| `setMessages(messages)` | Configure rule message text. |
| `upload()` | Start pending uploads and return a Promise resolving to their result array. |
| `retry(id)` | Retry a failed task by file ID. |
| `remove(id)` | Remove a file by ID and release its submission blocker. |
| `addFiles(files)` | Add application-provided files and follow autoUpload policy. |
| `setAdapter(adapter)` | Set the adapter function for this Upload instance in logic. |

## FAQ and boundaries

Unfinished and failed uploads block submission; removal releases the blocker. Applications own endpoints, authentication, preview and messages. Do not pass adapter functions through data or WXML.

[Headless hooks and controllers](hooks.md) · [Complete type signatures](api.md)
