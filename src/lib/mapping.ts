import { REQUIRED, type SourceRecord } from './records';
export const TARGET_FIELDS = ['recordId','customerName','email','phone','description','date'] as const;
export type TargetField = typeof TARGET_FIELDS[number];
export type FieldMapping = Record<TargetField,string>;
export function suggestMapping(headers:string[]):FieldMapping {
 const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,'');
 const aliases:Record<TargetField,string[]> = {
  recordId:['recordid','id','reference','referenceid','caseid','ticketid'],
  customerName:['customername','name','client','clientname','contactname'],
  email:['email','emailaddress','mail'],
  phone:['phone','phonenumber','mobile','mobilenumber','contactnumber'],
  description:['description','details','notes','summary','message'],
  date:['date','createddate','receiveddate','entrydate']
 };
 const mapping={} as FieldMapping;
 for(const field of TARGET_FIELDS){mapping[field]=headers.find(h=>aliases[field].includes(normalize(h)))??'';}
 return mapping;
}
export function validateMapping(mapping:FieldMapping):string[]{
 const errors:string[]=[];
 for(const field of REQUIRED)if(!mapping[field])errors.push('Map required field: '+field);
 const selected=Object.values(mapping).filter(Boolean);
 if(new Set(selected).size!==selected.length)errors.push('Each source column may map to only one destination field');
 return errors;
}
export function applyMapping(rows:Record<string,unknown>[],mapping:FieldMapping):Record<string,unknown>[] {
 return rows.map(row=>Object.fromEntries(TARGET_FIELDS.map(field=>[field,mapping[field]?row[mapping[field]]:''])));
}
export function sampleTemplate():SourceRecord[]{
 return [{recordId:'DEMO-001',customerName:'Sample Customer',email:'demo@example.test',phone:'555-0101',description:'Fictional test record',date:'2026-10-20'}];
}
