import {validateRows,type SourceRecord} from './records';
export const DEMO_STORAGE_KEY='flowbridge-demo-crm-v1';
export type DemoRecord=SourceRecord & {savedAt:string};
export const SEED_RECORDS:DemoRecord[]=[{recordId:'DEMO-001',customerName:'Avery Sample',email:'avery@example.test',phone:'555-0101',description:'Fictional onboarding request',date:'2026-10-20',savedAt:'2026-10-20T00:00:00.000Z'}];
export function checkDemoRecord(candidate:SourceRecord,existing:DemoRecord[]):string[]{
 const result=validateRows([candidate])[0];
 const errors=[...result.errors];
 if(existing.some(item=>item.recordId.toLowerCase()===candidate.recordId.trim().toLowerCase()))errors.push('Record ID already exists');
 return errors;
}
export function saveDemoRecord(candidate:SourceRecord,existing:DemoRecord[],now:string):DemoRecord[]{
 const errors=checkDemoRecord(candidate,existing);
 if(errors.length)throw new Error(errors.join('; '));
 return [...existing,{...candidate,recordId:candidate.recordId.trim(),savedAt:now}];
}
export function isDemoRecord(value:unknown):value is DemoRecord {
 if(!value||typeof value!=='object')return false;
 const row=value as Record<string,unknown>;
 return ['recordId','customerName','email','phone','description','date','savedAt'].every(field=>typeof row[field]==='string');
}
