# Models and validation

## Model ownership

Form owns the normalized model. initialValues establishes a reset baseline; model is an external synchronized snapshot. Edits update internal state before change, and equal external write-backs do not emit again. reset(values) loads a record and establishes a baseline; reset() restores it. setValues merges top-level keys, while setFieldValue updates a nested path.

Fields inherit name from the nearest named FormItem or declare it directly. Only one owner may register a path. Connected fields read the Form model; standalone fields use value/defaultValue. Paths support contact.email, rows[0].text and JavaScript path arrays.

## Field lifetime

Validation covers registered active fields that are not disabled. readonly prevents edits but retains validation. Unmount normally preserves values; preserve=false removes them. Preserved values remain in submit snapshots. active=false excludes a still-mounted field from validation and blocking.

## Values and choices

Input/Textarea use strings, Checkbox/Switch use Booleans, single choices store option values and multiple choices store value arrays. Zero and false are valid values. Options default to {label,value,disabled?}; labelKey/valueKey map application data. Native wheel indices never enter the model. Popup changes remain drafts until confirmation; cancel discards them.

## Rules and asynchronous validation

Built-in rules include required, type, accepted, minLength/maxLength, min/max and pattern/flags. Constraints and custom validators each run once. required does not reject 0 or false; use accepted to require checking.

A validator returns true or an empty string to pass, false for the default message, or a nonempty error string. Async validators use the same protocol. Rules merge in Form, FormItem and Field order. Input/Textarea default to blur; other fields default to change. Rules can override trigger. Text input with a visible error rechecks rules without explicit triggers.

Ordinary Pages register functions using selectComponent('#form').setValidators in onReady, then refer to them by a string validator name. Functions must not be passed through WXML/data. Hooks may supply validator functions directly. dependencies identifies related fields. debounce applies to interaction validation; submit validates immediately.

validate({paths?,silent?}) returns {status,values,errors}; status is valid, invalid or superseded. Model, rule, field or reset changes prevent old batches from applying stale state. errors contains path arrays, message and source. setFieldError sets an external error; null clears it. Submission does not erase external errors. hideErrors hides feedback without making an invalid field valid.

## Submission

Form emits change, statechange, validate, submit, invalid, reset and error. Fields retain native input/focus/blur/confirm detail; change adds value, previousValue, path and source. Events do not bubble by default; Form aggregates field changes itself.

FormButton normally permits an unvalidated form to validate and reveal errors. requireValid=true requires a known valid state, so use validateOnMount or explicit silent validation. Ordinary Pages synchronize submitting around application requests. A component does not await promises returned by event listeners.

Hook handleSubmit(handler) awaits the business handler and unlocks in finally; overlapping submissions on one instance are rejected.

## Hooks and dynamic fields

Use useForm and useField for custom native controls. Pass {form} directly inside Page setup, or use {scope:true} inside a custom component to connect native Form/Item relations. A composite control can register one object value. useFieldArray(form,path,{itemKey?}) exposes rows, append/remove/move/replace. Rows contain stable keys and current paths; moves/removals align field state. Replacing a list without itemKey rebuilds row identities.

## Upload adapters

Without an adapter, Upload only selects local files. Register a named adapter on Form with setUploadAdapters, use setAdapter for a standalone wrapper, or pass options.adapter to a hook. An adapter receives a file and onProgress, and returns {result,abort?}.

The application owns URL, authentication, parsing, preview and messages. FileValue items contain id, type and optional url/tempFilePath/name/size/poster. Successful uploads commit model values; pending or failed tasks block submit, and removal releases blocking. Defaults are accept=['image'], maxCount=9, maxSize=0 and retryCount=0. typeLimits constrains image/video separately. Selection order is preserved, and late results after cancel/unmount cannot restore files.

Complete native form, hook and adapter examples:

```sh
npm install ./reactive-mp-shared-1.0.0.tgz ./reactive-mp-runtime-1.0.0.tgz ./reactive-mp-reactivity-1.0.0.tgz ./reactive-mp-components-0.1.0.tgz
```

```json
{
  "usingComponents": {
    "rmp-form": "@reactive-mp/components/form/components/form/index",
    "rmp-form-item": "@reactive-mp/components/form/components/form-item/index",
    "rmp-input": "@reactive-mp/components/form/components/input/index",
    "rmp-form-button": "@reactive-mp/components/form/components/form-button/index"
  }
}
```

```js
Page({
  data: {
    model: { name: '' },
    rules: { name: [{ required: true, message: '请输入名称' }] },
  },
  onChange(event) { this.setData({ model: event.detail.values }); },
  onSubmit(event) { console.log(event.detail.values); },
});
```

```xml
<rmp-form id="form" model="{{model}}" rules="{{rules}}"
  bind:change="onChange" bind:submit="onSubmit">
  <rmp-form-item name="name" label="名称">
    <rmp-input placeholder="请输入名称" appearance="outline" />
  </rmp-form-item>
  <rmp-form-button action="submit">提交</rmp-form-button>
</rmp-form>
```

```js
import { definePage } from '@reactive-mp/runtime';
import { useForm, useField } from '@reactive-mp/components/form';

definePage(() => {
  const form = useForm({ initialValues: { name: '' }, rules: { name: [{ required: true }] } });
  const name = useField({ name: 'name' }, { form, validateOn: 'blur' });
  return {
    name: name.value,
    error: name.errorMessage,
    onInput: name.onInput,
    onBlur: name.onBlur,
    submit: form.handleSubmit(async values => console.log(values)),
  };
});
```

```xml
<input value="{{name}}" bindinput="onInput" bindblur="onBlur" />
<text>{{error}}</text>
<button bindtap="submit">提交</button>
```

```js
const adapter = (file, { onProgress }) => {
  let task;
  const result = new Promise((resolve, reject) => {
    task = wx.uploadFile({
      url: 'https://your-upload-domain.example/upload',
      filePath: file.tempFilePath,
      name: 'file',
      success(response) {
        try { resolve({ url: JSON.parse(response.data).url }); }
        catch (error) { reject(error); }
      },
      fail: reject,
    });
    task.onProgressUpdate(event => onProgress(event.progress));
  });
  return { result, abort: () => task.abort() };
};
```

See the individual [Upload](upload.md), [Form](form.md) and [Hooks](hooks.md) pages for complete wiring. Native relations, slot ordering, keyboard and real file selection still require WeChat DevTools/device verification.
