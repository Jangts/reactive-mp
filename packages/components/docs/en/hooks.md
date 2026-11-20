# Hooks and controllers

Declare hooks in synchronous setup. Pure controllers can be used without a native host. Return only the signals and handlers needed by the view; keep controllers and tasks in logic.

## Form bound to native controls

```js
import { definePage } from '@reactive-mp/runtime';
import { useForm, useField } from '@reactive-mp/components/form';

definePage(() => {
  const form = useForm({ initialValues: { name: '' }, rules: { name: [{ required: true }] } });
  const name = useField({ name: 'name' }, { form, validateOn: 'blur' });
  return { name: name.value, error: name.errorMessage, onInput: name.onInput,
    onBlur: name.onBlur, submit: form.handleSubmit(async values => console.log(values)) };
});
```

```xml
<input value="{{name}}" bindinput="onInput" bindblur="onBlur" />
<text>{{error}}</text>
<button bindtap="submit">Submit</button>
```

Use an empty page JSON and register the page in app.json. Enter text, leave the input and choose Submit to validate. Hooks do not render nodes for you.

## Hook reference

| Hook | Contract |
| --- | --- |
| `useForm(props,options?)` | Model/rule/submit controller; values/state are signals. |
| `useFormItem(props)` | Named field scope and feedback inside Component setup. |
| `useField(props,{form?,scope?,validateOn?})` | Connect a field and return value/error signals and native handlers. |
| `useChoice(props,options?)` | Boolean or option choice; options.multiple selects multiple values. |
| `useSelect(props,{kind?,...options})` | kind is select, column, date or region; includes draft/confirmation logic. |
| `useCascader(props,options?)` | Tree paths, levels, choices and event handlers. |
| `useCalendar(props,options?)` | Month, day cells, disabled dates and month navigation. |
| `useUpload(props,{adapter?,...options})` | File-list signal, selection, task control and cancellation. |
| `useFieldArray(form,path,{itemKey?})` | Dynamic row identity and append/remove/move/replace. |
| `useVideo(props,{group?,selector?,progressSelector?,emit?})` | Native video bindings; set group:false when binding a video directly in Page. |
| `useVideoGroup()` | Ancestor sound group exposing muteAll and memberCount. |
| `useVideoParticipant(mute)` | Join the nearest sound group with a custom mute callback. |
| `useSwiper(props,{emit?})` | Index, entries, renderOptions and native swiper event handlers. |
| `useMediaSwiper(props,options?)` | Mixed-media activation, muting and carousel events. |

## Controllers and lifecycle

createFormController owns model/validation without native nodes. registerField returns a lease that must be unregistered, and the controller must be disposed. createPlaybackController separates playback intent from named blockers; attach a play/pause target and dispose it. See [complete types](api.md) for every parameter and result.

For Video, bind every relevant native event to its returned handler and give the native node the configured selector/id. Swiper custom structures must bind onChange, transition and animation-finish handlers; renderOptions drives layout integration, not business data. Prefer the supplied wrappers when native wiring is not the customization goal.

Scopes own listeners and tasks. Do not copy relation-marker implementations or keep stale controllers after unmount. See [Form](form.md), [Video](video.md) and [Swiper](swiper.md) for wrapper alternatives.
