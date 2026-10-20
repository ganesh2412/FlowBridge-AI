import {test,expect} from '@playwright/test';
test('CSV import maps fields and transfers only valid synthetic records',async({page})=>{
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.goto('/import');
 const csv=[
  'Case ID,Client Name,Email Address,Notes,Created Date',
  'FLOW-101,Test Customer One,one@example.test,Fictional request,2026-10-20',
  'FLOW-102,Test Customer Two,two@example.test,Fictional followup,2026-10-20',
  'FLOW-102,Test Duplicate,duplicate@example.test,Duplicate test,2026-10-20',
  'FLOW-103,,missing@example.test,Invalid customer,2026-10-20'
 ].join('\n');
 await page.locator('input[type="file"]').setInputFiles({name:'synthetic-demo.csv',mimeType:'text/csv',buffer:Buffer.from(csv)});
 await expect(page.getByRole('heading',{name:/Map source columns/})).toBeVisible();
 await expect(page.getByText(/^Valid:\s*2$/)).toBeVisible();
 await expect(page.getByText(/^Invalid:\s*1$/)).toBeVisible();
 await expect(page.getByText(/^Duplicates:\s*1$/)).toBeVisible();
 await page.getByTestId('transfer-to-crm').click();
 await expect(page.getByTestId('transfer-status')).toContainText('2 saved, 2 skipped');
 await page.goto('/demo-crm');
 await expect(page.getByTestId('crm-row-FLOW-101')).toContainText('Test Customer One');
 await expect(page.getByTestId('crm-row-FLOW-102')).toContainText('Test Customer Two');
 await expect(page.getByTestId('crm-row-FLOW-103')).toHaveCount(0);
 await page.reload();
 await expect(page.getByTestId('crm-row-FLOW-101')).toBeVisible();
});
