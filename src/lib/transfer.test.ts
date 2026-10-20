import {describe,it,expect} from 'vitest';
import {validateRows} from './records';
import {SEED_RECORDS} from './demo-crm';
import {transferValidatedRows} from './transfer';
describe('validated transfer',()=>{
 it('saves valid records and reports invalid and duplicate records',()=>{
  const rows=validateRows([
   {recordId:'TEST-1',customerName:'Synthetic One',description:'Demo',date:'2026-10-20'},
   {recordId:'TEST-1',customerName:'Synthetic Two',description:'Demo',date:'2026-10-20'},
   {recordId:'DEMO-001',customerName:'Synthetic Three',description:'Demo',date:'2026-10-20'},
   {recordId:'BAD-1',customerName:'',description:'Demo',date:'2026-10-20'}
  ]);
  const result=transferValidatedRows(rows,SEED_RECORDS,'2026-10-20T00:00:00Z');
  expect(result.outcomes.map(item=>item.status)).toEqual(['saved','skipped','skipped','skipped']);
  expect(result.records).toHaveLength(2);
 });
});
