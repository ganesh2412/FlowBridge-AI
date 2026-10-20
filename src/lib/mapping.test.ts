import {describe,it,expect} from 'vitest';
import {applyMapping,suggestMapping,validateMapping} from './mapping';
describe('field mapping',()=>{
 it('suggests common spreadsheet headers',()=>{const m=suggestMapping(['Case ID','Client Name','Email Address','Notes','Created Date']);expect(m.recordId).toBe('Case ID');expect(m.customerName).toBe('Client Name');expect(m.description).toBe('Notes');});
 it('rejects repeated source columns',()=>{const m=suggestMapping(['id','name','notes','date']);m.customerName='id';expect(validateMapping(m)).toContain('Each source column may map to only one destination field');});
 it('maps values into canonical fields',()=>{const m=suggestMapping(['Case ID','Client Name','Notes','Date']);expect(applyMapping([{'Case ID':'A-1','Client Name':'Demo',Notes:'Test',Date:'2026-10-20'}],m)[0].recordId).toBe('A-1');});
});
