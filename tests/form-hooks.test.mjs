import test from 'node:test';
import assert from 'node:assert/strict';
import {definePage} from '@reactive-mp/runtime';
import {useForm,useField,useSelect,useChoice,useUpload,useCalendar,useCascader,useFieldArray} from '@reactive-mp/components/form';
globalThis.Behavior=options=>options;let definition;
globalThis.Page=options=>{definition=options};globalThis.Component=options=>{definition=options};
const tick=async()=>{for(let i=0;i<16;i++){await Promise.resolve();}};
function mount(options,values={},alias=false){
 const defaults=Object.fromEntries(Object.entries(options.properties??{}).map(([key,schema])=>{const type=schema.type??schema;return [key,Object.hasOwn(schema,'value')?schema.value:type===Boolean?false:type===String?'':type===Number?0:type===Array?[]:null]}));
 const events=[];
 const instance={data:{...defaults,...options.data},properties:{...defaults,...values},getPageId:()=>42,selectOwnerComponent:()=>null,triggerEvent:(name,detail)=>events.push({name,detail}),setData(update,callback){Object.assign(this.data,update);if(alias){for(const behavior of options.behaviors??[]){behavior.observers?.['**']?.call(this)}}callback?.();}};
 if(alias){Object.assign(instance.data,instance.properties);instance.properties=instance.data;}
 Object.assign(instance,options.methods??Object.fromEntries(Object.entries(options).filter(([,value])=>typeof value==='function')));
 for(const behavior of options.behaviors??[]){behavior.lifetimes?.created?.call(instance)}
 for(const behavior of options.behaviors??[]){behavior.lifetimes?.attached?.call(instance)}
 options.lifetimes?.attached?.call(instance);options.onLoad?.call(instance);
 return {instance,events,link(name,target){options.relations[name].linked.call(instance,target.instance);},update(next){Object.assign(instance.properties,next);for(const behavior of options.behaviors??[]){behavior.observers?.['**']?.call(instance)}},detach(){options.lifetimes?.detached?.call(instance);options.onUnload?.call(instance);}};
}
await import('../packages/components/miniprogram/form/components/form/index.js');const rootDefinition=definition;
await import('../packages/components/miniprogram/form/components/form-item/index.js');const itemDefinition=definition;
await import('../packages/components/miniprogram/form/components/input/index.js');const inputDefinition=definition;
await import('../packages/components/miniprogram/form/components/form-button/index.js');const buttonDefinition=definition;

test('ordinary components register through native relations, inherit rules, and isolate forms',async()=>{
 const first=mount(rootDefinition,{model:{email:''},rules:{email:[{required:true}]}});const second=mount(rootDefinition,{model:{email:'other'}});
 const item=mount(itemDefinition,{name:'email',label:'邮箱'});item.link('form-root',first);
 const input=mount(inputDefinition);input.link('form-root',first);input.link('form-item',item);await tick();
 assert.equal(first.instance.getValues().email,'');input.instance.onInput({detail:{value:'hello',cursor:5}});await tick();
 assert.equal(first.instance.getValues().email,'hello');assert.equal(second.instance.getValues().email,'other');assert.equal(input.instance.data.fieldValue,'hello');
 const button=mount(buttonDefinition);button.link('form-root',first);await tick();await button.instance.onTap();await tick();assert.equal(first.events.some(x=>x.name==='submit'),true);
 first.instance.setFieldValue('email','');await first.instance.validate();await tick();assert.ok(item.instance.data.itemError);assert.equal(input.instance.data.fieldDisabled,false);
 item.update({disabled:true});await tick();assert.equal(input.instance.data.fieldDisabled,true);assert.equal((await first.instance.validate()).status,'valid');
 input.detach();item.detach();button.detach();first.detach();second.detach();
});
test('Reactive Page hooks bind native input and clean up without component rendering',async()=>{
 let form;definePage(()=>{form=useForm({initialValues:{name:''},rules:{name:[{required:true}]}});const field=useField({name:'name'},{form,validateOn:'blur'});return {text:field.value,error:field.errorMessage,onInput:field.onInput,onBlur:field.onBlur,onSubmit:form.handleSubmit(()=>{})};});
 const page=mount(definition);assert.equal((await page.instance.onSubmit()).status,'invalid');page.instance.onInput({detail:{value:'ok',cursor:2}});await tick();assert.equal(page.instance.data.text,'ok');assert.equal((await page.instance.onSubmit()).status,'submitted');page.detach();assert.equal((await form.submit()).status,'blocked');
});
test('selection draft cancellation, option zero values, and native index conversion',async()=>{
 let select,choice;definePage(()=>{select=useSelect({defaultValue:[0],multiple:true,options:[{label:'zero',value:0},{label:'one',value:1}]});choice=useChoice({defaultValue:[],options:[{label:'zero',value:0}]},{multiple:true});return {};});const page=mount(definition);
 select.open();select.onDraft({currentTarget:{dataset:{index:1}}});select.close();assert.deepEqual(select.value(),[0]);
 select.open();select.onDraft({currentTarget:{dataset:{index:1}}});select.confirm();assert.deepEqual(select.value(),[0,1]);
 choice.onChoose({currentTarget:{dataset:{index:0}}});assert.deepEqual(choice.value(),[0]);
 page.detach();
});
test('calendar includes leap day and honours exact date limits',()=>{
 let calendar;definePage(()=>{calendar=useCalendar({month:'2024-02',min:'2024-02-02',max:'2024-02-29'});return {};});const page=mount(definition);
 assert.equal(calendar.days().filter(x=>x.value).length,29);assert.equal(calendar.days().find(x=>x.value==='2024-02-01').disabled,true);assert.equal(calendar.days().at(-1).disabled,false);page.detach();
});
test('upload hook blocks form while manual task is pending and reset removes the task',async()=>{
 let upload,form;definePage(()=>{form=useForm({initialValues:{files:[]}});upload=useUpload({name:'files',autoUpload:false},{form,adapter:()=>({result:Promise.resolve({url:'remote'})})});return {};});const page=mount(definition);
 await upload.addFiles([{type:'image',tempFilePath:'/tmp/x'}]);assert.equal(form.getState().pending,true);assert.equal((await form.submit()).status,'blocked');await upload.upload();assert.equal(form.getState().pending,false);assert.equal(form.getValues().files[0].url,'remote');form.reset();assert.deepEqual(form.getValues().files,[]);assert.deepEqual(upload.files(),[]);page.detach();
});
test('field arrays preserve row identities and model values through moves/removals',async()=>{
 let array,form;definePage(()=>{form=useForm({initialValues:{rows:[{text:'a'},{text:'b'}]}});array=useFieldArray(form,'rows');return {};});const page=mount(definition);
 const keys=array.rows().map(x=>x.key);array.move(1,0);assert.deepEqual(array.rows().map(x=>x.key),[keys[1],keys[0]]);assert.deepEqual(form.getValues().rows.map(x=>x.text),['b','a']);array.remove(0);assert.equal(array.rows()[0].key,keys[0]);array.append({text:'c'});assert.equal(array.rows().length,2);page.detach();
});

test('unrelated model updates do not discard an open multi-select draft',async()=>{
 let form,select;definePage(()=>{form=useForm({initialValues:{choices:[0],other:''}});select=useSelect({name:'choices',multiple:true,options:[{label:'zero',value:0},{label:'one',value:1}]},{form});return {};});const page=mount(definition);
 select.open();select.onDraft({currentTarget:{dataset:{index:1}}});form.setFieldValue('other','changed');await tick();assert.equal(select.opened(),true);select.confirm();assert.deepEqual(form.getValues().choices,[0,1]);page.detach();
});
test('array reset restores original baseline after append, move and remove',()=>{
 let form,array;definePage(()=>{form=useForm({initialValues:{rows:[{text:'a'},{text:'b'}]}});array=useFieldArray(form,'rows');return {};});const page=mount(definition);
 array.append({text:'c'});array.move(0,2);array.remove(0);form.reset();assert.deepEqual(form.getValues().rows,[{text:'a'},{text:'b'}]);page.detach();
});

test('native properties/data alias does not feed generated field state back into props',async()=>{
 const form=mount(rootDefinition,{model:{email:''},rules:{email:[{required:true}]}},true);const item=mount(itemDefinition,{name:'email'},true);const input=mount(inputDefinition,{},true);
 item.link('form-root',form);input.link('form-root',form);input.link('form-item',item);await tick();
 assert.equal(input.instance.properties.required,false);assert.equal(input.instance.data.fieldRequired,true);input.instance.onInput({detail:{value:'ok'}});await tick();assert.equal(form.instance.getValues().email,'ok');assert.equal(input.instance.properties.value,null);
 input.update({disabled:true});await tick();assert.equal(input.instance.data.fieldDisabled,true);input.detach();item.detach();form.detach();
});
