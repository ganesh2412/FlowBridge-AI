import {test,expect} from '@playwright/test';
import ExcelJS from 'exceljs';

test.beforeEach(async({page})=>{await page.goto('/import');await page.evaluate(()=>localStorage.clear());});

test('imports real XLSX with mapped columns and valid dates',async({page})=>{
 const workbook=new ExcelJS.Workbook();
 const sheet=workbook.addWorksheet('Synthetic');
 sheet.addRow(['Case ID','Client Name','Email Address','Notes','Created Date']);
 sheet.addRow(['XLSX-101','Synthetic Excel Customer','excel@example.test','Fictional XLSX row','2026-10-20']);
 const bytes=await workbook.xlsx.writeBuffer();
 await page.locator('input[type="file"]').setInputFiles({name:'synthetic.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(bytes)});
 await expect(page.getByText(/^Valid:\s*1$/)).toBeVisible();
 await page.getByTestId('transfer-to-crm').click();
 await expect(page.getByTestId('transfer-status')).toContainText('1 saved, 0 skipped');
 await page.goto('/demo-crm');
 await expect(page.getByTestId('crm-row-XLSX-101')).toContainText('Synthetic Excel Customer');
});

test('rejects malformed XLSX without saving records',async({page})=>{
 await page.locator('input[type="file"]').setInputFiles({name:'broken.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from('not a valid workbook')});
 await expect(page.getByRole('alert')).toBeVisible();
 await expect(page.getByTestId('transfer-to-crm')).toHaveCount(0);
});

test('rejects duplicate CSV column headers',async({page})=>{
 await page.locator('input[type="file"]').setInputFiles({name:'duplicate.csv',mimeType:'text/csv',buffer:Buffer.from('Case ID,Case ID,Client Name,Notes,Created Date\nONE,TWO,Demo,Example,2026-10-20')});
 await expect(page.getByText('Duplicate column headers found')).toBeVisible();
 await expect(page.getByTestId('transfer-to-crm')).toHaveCount(0);
});
