import {describe,it,expect} from 'vitest';
import {summarizeExecution,exportExecutionCsv} from './execution-report';
describe('execution report',()=>{
 const rows=[{row:2,recordId:'DEMO-1',status:'saved' as const,reason:''},{row:3,recordId:'DEMO-2',status:'skipped' as const,reason:'Invalid "email", retry'}];
 it('calculates accurate counts',()=>expect(summarizeExecution(rows)).toEqual({total:2,saved:1,skipped:1,successRate:50}));
 it('escapes CSV quotes and commas',()=>expect(exportExecutionCsv(rows)).toContain('"Invalid ""email"", retry"'));
 it('handles empty runs',()=>expect(summarizeExecution([]).successRate).toBe(0));
});
