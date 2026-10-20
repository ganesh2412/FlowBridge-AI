import {test,expect,type Page} from '@playwright/test';
import {validateRows,type SourceRecord} from '../src/lib/records';
import {summarizeExecution} from '../src/lib/execution-report';
import type {TransferOutcome} from '../src/lib/transfer';

async function submitViaBrowser(page:Page,record:SourceRecord){
 for(const [field,value] of Object.entries(record))await page.getByTestId('crm-'+field).fill(value);
 await page.getByTestId('crm-save').click();
 const message=await page.getByTestId('crm-status').innerText();
 if(!message.includes('Demo record saved'))throw new Error(message||'CRM did not confirm save');
 await expect(page.getByTestId('crm-row-'+record.recordId)).toContainText(record.customerName);
}

test('batch browser worker reports saved skipped and continues after failures',async({page})=>{
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 const source=[
  {recordId:'BOT-201',customerName:'Synthetic One',email:'one@example.test',phone:'',description:'First synthetic case',date:'2026-10-20'},
  {recordId:'DEMO-001',customerName:'Duplicate Existing',email:'',phone:'',description:'Existing CRM ID',date:'2026-10-20'},
  {recordId:'BOT-202',customerName:'',email:'',phone:'',description:'Missing required customer',date:'2026-10-20'},
  {recordId:'BOT-203',customerName:'Synthetic Three',email:'three@example.test',phone:'',description:'Final synthetic case',date:'2026-10-20'},
 ];
 const outcomes:TransferOutcome[]=[];
 for(const item of validateRows(source)){
  if(item.errors.length||item.duplicate){
   outcomes.push({row:item.row,recordId:item.record.recordId,status:'skipped',reason:[...item.errors,...(item.duplicate?['Duplicate in source']:[])].join('; ')});
   continue;
  }
  try{
   await submitViaBrowser(page,item.record);
   outcomes.push({row:item.row,recordId:item.record.recordId,status:'saved',reason:''});
  }catch(error){
   outcomes.push({row:item.row,recordId:item.record.recordId,status:'skipped',reason:error instanceof Error?error.message:'Unknown browser failure'});
  }
 }
 expect(outcomes.map(outcome=>outcome.status)).toEqual(['saved','skipped','skipped','saved']);
 expect(outcomes[1].reason).toContain('Record ID already exists');
 expect(outcomes[2].reason).toContain('Missing customerName');
 expect(summarizeExecution(outcomes)).toMatchObject({total:4,saved:2,skipped:2,successRate:50});
 await page.reload();
 await expect(page.getByTestId('crm-row-BOT-201')).toBeVisible();
 await expect(page.getByTestId('crm-row-BOT-203')).toBeVisible();
 await expect(page.getByTestId('crm-row-BOT-202')).toHaveCount(0);
});
