import {describe,it,expect} from 'vitest';
import {SEED_RECORDS,checkDemoRecord,saveDemoRecord,isDemoRecord} from './demo-crm';
describe('demo CRM',()=>{
 const record={recordId:'DEMO-002',customerName:'Taylor Fictional',email:'taylor@example.test',phone:'555-0102',description:'Test case',date:'2026-10-20'};
 it('saves a valid synthetic record',()=>{const rows=saveDemoRecord(record,SEED_RECORDS,'2026-10-20T00:00:00Z');expect(rows).toHaveLength(2);expect(rows[1].recordId).toBe('DEMO-002');});
 it('rejects duplicate identifiers case-insensitively',()=>{expect(checkDemoRecord({...record,recordId:'demo-001'},SEED_RECORDS)).toContain('Record ID already exists');});
 it('rejects malformed storage objects',()=>{expect(isDemoRecord({recordId:'x'})).toBe(false);});
});
