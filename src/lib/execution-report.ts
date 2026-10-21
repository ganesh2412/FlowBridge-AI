import type {TransferOutcome} from './transfer';
export type ExecutionSummary={total:number;saved:number;skipped:number;successRate:number};
export function summarizeExecution(outcomes:TransferOutcome[]):ExecutionSummary{
 const saved=outcomes.filter(row=>row.status==='saved').length;
 const skipped=outcomes.length-saved;
 return {total:outcomes.length,saved,skipped,successRate:outcomes.length?Math.round(saved/outcomes.length*100):0};
}
export function exportExecutionCsv(outcomes:TransferOutcome[],executedAt?:string):string{
 const quote=(value:string|number)=>'"'+String(value).replace(/"/g,'""')+'"';
 return [['row','recordId','status','reason','executedAt'].join(','),...outcomes.map(row=>[row.row,row.recordId,row.status,row.reason|| (row.status==='saved'?'Saved to browser-local Demo CRM':'Skipped'),executedAt??''].map(quote).join(','))].join('\r\n');
}
