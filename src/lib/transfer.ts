import {type ValidationResult} from './records';
import {saveDemoRecord,type DemoRecord} from './demo-crm';
export type TransferOutcome={row:number;recordId:string;status:'saved'|'skipped';reason:string};
export function transferValidatedRows(results:ValidationResult[],existing:DemoRecord[],now:string):{records:DemoRecord[];outcomes:TransferOutcome[]} {
 let records=[...existing];
 const outcomes:TransferOutcome[]=[];
 for(const result of results){
  if(result.errors.length||result.duplicate){outcomes.push({row:result.row,recordId:result.record.recordId,status:'skipped',reason:[...result.errors,...(result.duplicate?['Duplicate in file']:[])].join('; ')});continue;}
  try{records=saveDemoRecord(result.record,records,now);outcomes.push({row:result.row,recordId:result.record.recordId,status:'saved',reason:''});}
  catch(e){outcomes.push({row:result.row,recordId:result.record.recordId,status:'skipped',reason:e instanceof Error?e.message:'Save failed'});}
 }
 return {records,outcomes};
}
