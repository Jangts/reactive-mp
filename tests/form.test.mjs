import test from 'node:test';
import assert from 'node:assert/strict';
import {createFormController, validateValues} from '@reactive-mp/components/form';
import {createUploadQueue} from '../packages/components/miniprogram/form/utils/upload-tasks.js';
import {toPath, getValue, putValue} from '../packages/components/miniprogram/form/utils/value-path.js';
const tick = async () => {for(let i=0;i<12;i++){await Promise.resolve();}};
const deferred = () => {let resolve; const promise=new Promise(done=>{resolve=done}); return {promise,resolve};};

test('paths preserve false/zero, literal keys and reject prototype access',()=>{
 const values={};putValue(values,'items[0].checked',false);putValue(values,['a.b'],0);
 assert.equal(getValue(values,'items[0].checked'),false);assert.equal(getValue(values,['a.b']),0);
 assert.deepEqual(toPath('items[0].checked'),['items',0,'checked']);assert.throws(()=>putValue({},'__proto__.x',1));
});
test('builtin constraints compose once with custom validators and async data validation',async()=>{
 let calls=0; const validator=()=>{calls++;return true};
 assert.equal((await validateValues({name:''},{name:[{required:true,minLength:3,validator}]})).status,'invalid');assert.equal(calls,0);
 assert.equal((await validateValues({name:'abc'},{name:[{required:true,minLength:3,validator}]})).status,'valid');assert.equal(calls,1);
 assert.equal((await validateValues({flag:false,n:0,list:[]},{flag:{type:'boolean'},n:{required:true,type:'number'},list:{required:true}})).status,'invalid');
 assert.equal((await validateValues({x:'a'},{x:{validator:async()=>true}})).status,'valid');
 assert.equal((await validateValues({x:'a'},{x:{validator:'named'}},{validators:{named:()=>true}})).status,'valid');
});
test('registration, external sync, snapshots, reset and duplicate ownership',async()=>{
 const events=[];const form=createFormController({initialValues:{email:''},rules:{email:[{required:true}]}},{emit:(name,detail)=>events.push({name,detail})});
 const field=form.registerField('email');assert.throws(()=>form.registerField('email'));
 assert.equal(form.getState().valid,false);assert.equal((await form.submit()).status,'invalid');
 form.setFieldValue('email','a'); const count=events.length;form.syncModel({email:'a'});assert.equal(events.length,count);
 assert.equal((await form.validate()).status,'valid');form.setFieldError('email','server');assert.equal((await form.submit()).status,'invalid');
 form.hideErrors();assert.equal(form.getFieldState('email').errorMessage,'');assert.equal(form.getState().valid,false);
 form.setFieldValue('email','b');assert.equal((await form.submit()).status,'submitted');const snapshot=form.getValues();snapshot.email='other';assert.equal(form.getValues().email,'b');
 form.reset();assert.equal(form.getValues().email,'');assert.equal(form.getState().dirty,false);field.unregister();assert.equal(form.getValues().email,'');
});
test('triggers retain unmatched errors and validity tracks all rules',async()=>{
 const form=createFormController({initialValues:{a:''}});form.registerField('a',{rules:[{required:true,trigger:'blur'},{minLength:3,trigger:'change'}]});
 await form.validate();assert.equal(form.getState().valid,false);
 await form.validateField('a',{event:'focus'});assert.equal(form.getState().valid,false);
 form.setFieldValue('a','abc');await form.validateField('a',{event:'change'});assert.equal(form.getState().valid,false);
 await form.validateField('a',{event:'blur'});assert.equal(form.getState().valid,true);
});
test('async work is superseded promptly by changes, reset, unregistration and disposal',async()=>{
 for(const change of ['value','reset','unregister','dispose']){
  const d=deferred();const form=createFormController({initialValues:{a:'old'}});const lease=form.registerField('a',{rules:[{validator:()=>d.promise}]});
  const validating=form.validate(); await tick();
  if(change==='value'){form.setFieldValue('a','new')}else if(change==='unregister'){lease.unregister()}else{form[change]()}
  assert.equal((await validating).status,'superseded'); d.resolve('old error');await tick();assert.equal(form.getState().errors.length,0);
 }
});
test('disabled/active participation, readonly validation and preserve=false',async()=>{
 const form=createFormController({initialValues:{a:''}});const lease=form.registerField('a',{rules:[{required:true}]});
 await form.validate();lease.update({disabled:true,rules:[{required:true}]});assert.equal((await form.validate()).status,'valid');assert.equal(form.getState().errors.length,0);
 lease.update({readonly:true,preserve:false,rules:[{required:true}]});assert.equal((await form.validate()).status,'invalid');lease.unregister();assert.deepEqual(form.getValues(),{});
});
test('dependencies revalidate without recursive request loops',async()=>{
 const form=createFormController({initialValues:{password:'x',confirmation:'x'}});form.registerField('password');
 form.registerField('confirmation',{rules:[{dependencies:['password'],validator:(value,ctx)=>value===ctx.values.password || 'different'}]});
 assert.equal((await form.validate()).status,'valid');form.setFieldValue('password','y');await tick();assert.equal(form.getFieldState('confirmation').errors[0].message,'different');
});
test('submission awaits handlers, guards duplicate attempts and always unlocks',async()=>{
 const d=deferred();const form=createFormController({initialValues:{a:'x'}});form.registerField('a');
 const submit=form.handleSubmit(()=>d.promise);const first=submit();await tick();assert.equal(form.getState().submitting,true);assert.equal((await submit()).status,'blocked');d.resolve();assert.equal((await first).status,'submitted');assert.equal(form.getState().canSubmit,true);
 await assert.rejects(form.handleSubmit(()=>{throw Error('server')})());assert.equal(form.getState().canSubmit,true);
});
test('upload keeps selection order, distinguishes pending/error, ignores cancelled receipts',async()=>{
 let values=[];let pending=false;const tasks=[];const ds=[];
 const queue=createUploadQueue({getValues:()=>values,commit:value=>{values=value},getProps:()=>({accept:['image'],maxCount:3}),getAdapter:()=>file=>{const d=deferred();ds.push(d);return {result:d.promise}},onPending:value=>{pending=value},onChange:value=>{tasks.splice(0,tasks.length,...value)}});
 const adding=queue.add([{id:'a',type:'image'},{id:'b',type:'image'}]);assert.equal(pending,true);ds[1].resolve({url:'b'});await tick();ds[0].resolve({url:'a'});await adding;assert.deepEqual(values.map(x=>x.id),['a','b']);assert.equal(pending,false);
 const late=queue.add([{id:'c',type:'image'}]);queue.remove('c');await late;ds[2].resolve({url:'c'});await tick();assert.deepEqual(values.map(x=>x.id),['a','b']);queue.dispose();
});
test('upload validates limits, selects without networking, supports retry and reset',async()=>{
 let values=[];let pending=false;let fail=true;let errors=0;
 const queue=createUploadQueue({getValues:()=>values,commit:value=>{values=value},getProps:()=>({maxCount:2,maxSize:5}),getAdapter:()=>()=>({result:fail?Promise.reject(Error('failed')):Promise.resolve({url:'ok'})}),onPending:value=>{pending=value},emit:name=>{if(name==='uploaderror'){errors++}}});
 await queue.add([{id:'a',type:'image',size:3},{id:'b',type:'image',size:7}]);assert.equal(errors,2);assert.equal(pending,true);assert.equal(values.length,0);fail=false;await queue.retry('a');assert.equal(pending,false);assert.equal(values[0].url,'ok');queue.reset();
 const selected=createUploadQueue({getValues:()=>values,commit:value=>{values=value},getProps:()=>({maxCount:3}),getAdapter:()=>null});await selected.add([{id:'b',type:'image'}]);assert.equal(values[1].id,'b');
});

test('array reorder moves error ownership and row dirty state, deletion drops the record',async()=>{
 const form=createFormController({initialValues:{rows:[{text:'a'},{text:'b'}]}});
 const first=form.registerField('rows[0].text');const second=form.registerField('rows[1].text');form.setFieldError('rows[0].text','a error');
 form.reorderArray('rows',[{text:'b'},{text:'a'}],[1,0]);assert.deepEqual(first.path,['rows',1,'text']);assert.equal(form.getFieldState('rows[1].text').errorMessage,'a error');assert.equal(form.getFieldState('rows[1].text').dirty,false);assert.equal(form.getState().dirty,true);
 form.reorderArray('rows',[{text:'a'}],[1]);assert.equal(form.getFieldState('rows[1].text'),undefined);second.unregister();assert.equal(form.getFieldState('rows[0].text').errorMessage,'a error');first.unregister();
});
