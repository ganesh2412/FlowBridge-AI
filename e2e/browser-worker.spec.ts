import {test,expect} from '@playwright/test';
import {validateRows} from '../src/lib/records';
import {transferValidatedRows} from '../src/lib/transfer';
import {SEED_RECORDS} from '../src/lib/demo-crm';

test('Playwright worker fills fictional CRM through UI and verifies persisted result',async({page})=>{
 const candidate={recordId:'BOT-101',customerName:'Synthetic Browser Worker',email:'worker@example.test',phone:'555-0123',description:'Fictional browser automation',date:'2026-10-20'};
 const validated=validateRows([candidate]);
 const plan=transferValidatedRows(validated,SEED_RECORDS,'2026-10-20T00:00:00.000Z');
 expect(plan.outcomes).toMatchObject([{status:'saved',recordId:'BOT-101'}]);
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 for(const [field,value] of Object.entries(candidate))await page.getByTestId('crm-'+field).fill(value);
 await page.getByTestId('crm-save').click();
 await expect(page.getByTestId('crm-status')).toContainText('Demo record saved');
 await expect(page.getByTestId('crm-row-BOT-101')).toContainText('Synthetic Browser Worker');
 await page.reload();
 await expect(page.getByTestId('crm-row-BOT-101')).toContainText('Fictional browser automation');
});

test('Playwright worker does not create duplicate fictional records',async({page})=>{
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await page.getByTestId('crm-recordId').fill('DEMO-001');
 await page.getByTestId('crm-customerName').fill('Duplicate Sample');
 await page.getByTestId('crm-description').fill('Should be rejected');
 await page.getByTestId('crm-date').fill('2026-10-20');
 await page.getByTestId('crm-save').click();
 await expect(page.getByTestId('crm-status')).toContainText('Record ID already exists');
 await expect(page.getByTestId('crm-row-DEMO-001')).toHaveCount(1);
});
