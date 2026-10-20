import type {TransferOutcome} from './transfer';
import {summarizeExecution,type ExecutionSummary} from './execution-report';
export const EXECUTION_HISTORY_KEY='flowbridge-execution-history-v1';
export const MAX_EXECUTION_HISTORY=20;
export type ExecutionEntry={id:string;executedAt:string;sourceFile:string;summary:ExecutionSummary;outcomes:TransferOutcome[]};
export function makeExecutionEntry(sourceFile:string,outcomes:TransferOutcome[],executedAt:string):ExecutionEntry{
 return {id:executedAt+'-'+Math.random().toString(36).slice(2,9),executedAt,sourceFile,summary:summarizeExecution(outcomes),outcomes:outcomes.map(item=>({...item}))};
}
export function isExecutionEntry(value:unknown):value is ExecutionEntry{
 if(!value||typeof value!=='object')return false;
 const entry=value as Record<string,unknown>;
 if(typeof entry.id!=='string'||typeof entry.executedAt!=='string'||typeof entry.sourceFile!=='string'||!Array.isArray(entry.outcomes)||entry.outcomes.length>1000)return false;
 return entry.outcomes.every((item:unknown)=>{if(!item||typeof item!=='object')return false;const row=item as Record<string,unknown>;return Number.isInteger(row.row)&&typeof row.recordId==='string'&&(row.status==='saved'||row.status==='skipped')&&typeof row.reason==='string';});
}
export function readExecutionHistory(raw:string|null):ExecutionEntry[]{
 if(!raw)return [];
 const parsed:unknown=JSON.parse(raw);
 if(!Array.isArray(parsed)||parsed.length>MAX_EXECUTION_HISTORY||!parsed.every(isExecutionEntry))throw new Error('Invalid execution history. Clear it from the history page.');
 return parsed;
}
export function appendExecutionHistory(existing:ExecutionEntry[],entry:ExecutionEntry):ExecutionEntry[]{
 return [entry,...existing].slice(0,MAX_EXECUTION_HISTORY);
}
