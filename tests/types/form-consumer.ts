import {useForm,useField,useChoice,useSelect,useUpload,useCalendar,useCascader,useFieldArray,createFormController,validateValues,type UploadAdapter,type Rule} from '@reactive-mp/components/form';
const rules: Record<string,Rule[]> = {name:[{required:true}],confirmation:[{dependencies:['name'],validator:async(value,ctx)=>value===ctx.values.name || 'different'}]};
const form=useForm({initialValues:{name:'',rows:[],files:[]},rules});
const field=useField<string>({name:'name'},{form});const value: string=field.value();
field.onInput({detail:{value}});form.setFieldValue('name',false);form.getFieldState<string>('name')?.value.toUpperCase();
form.handleSubmit(async(values)=>{values.name.toUpperCase()});
const choice=useChoice({defaultValue:[],options:[{label:'zero',value:0}]},{form,multiple:true});choice.onToggle();
useSelect({options:[{label:'a',value:'a'}],multiple:true});useCascader({options:[]});useCalendar({min:'2024-01-01'}).nextMonth();
const adapter:UploadAdapter=(file,{onProgress})=>{onProgress(100);return {result:Promise.resolve({url:'https://example.test/'+file.id}),abort(){}}};
const upload=useUpload({name:'files',autoUpload:false},{form,adapter});upload.addFiles([{type:'image',tempFilePath:'/tmp/file'}]);
form.setUploadAdapters({adapter});useFieldArray<{text:string}>(form,'rows').append({text:'a'});
createFormController({initialValues:{n:0}}).dispose();validateValues({name:''},rules);
// @ts-expect-error custom validators have one success convention
const invalid: Rule = {validator:()=>[true,'']};
void invalid;
