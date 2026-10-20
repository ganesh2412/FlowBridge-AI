import {describe,it,expect} from 'vitest';
import {validateRows} from './records';
describe('validateRows',()=>{it('detects duplicate IDs',()=>{const row={recordId:'A1',customerName:'Demo',description:'Test',date:'2026-10-20'};expect(validateRows([row,row])[1].duplicate).toBe(true)});it('requires essential fields',()=>{expect(validateRows([{}])[0].errors.length).toBe(4)});});
