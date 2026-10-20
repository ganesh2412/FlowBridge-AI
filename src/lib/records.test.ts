import {describe,it,expect} from 'vitest';
import {validateRows} from './records';
describe('validateRows',()=>{it('detects duplicate IDs',()=>{const row={recordId:'A1',customerName:'Demo',description:'Test',date:'2026-10-20'};expect(validateRows([row,row])[1].duplicate).toBe(true)});it('requires essential fields',()=>{expect(validateRows([{}])[0].errors.length).toBe(4)});});

const row=(date:string)=>({recordId:'DATE-1',customerName:'Synthetic Customer',description:'Test record',date,email:'',phone:''});
describe('calendar date validation',()=>{
 it('accepts leap day',()=>{expect(validateRows([row('2024-02-29')])[0].errors).toEqual([]);});
 it.each(['2025-02-29','2026-02-30','2026-13-01','2026-00-10','2026-04-31','2026-01-00'])('rejects impossible date %s',date=>{
  expect(validateRows([row(date)])[0].errors).toContain('Invalid date');
 });
 it('requires ISO format',()=>{expect(validateRows([row('20/10/2026')])[0].errors).toContain('Date must use YYYY-MM-DD');});
});
