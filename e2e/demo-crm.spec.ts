import {test,expect} from '@playwright/test';
test('synthetic CRM saves a record and survives reload',async({page})=>{
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await page.getByTestId('crm-recordId').fill('E2E-001');
 await page.getByTestId('crm-customerName').fill('Playwright Synthetic');
 await page.getByTestId('crm-email').fill('playwright@example.test');
 await page.getByTestId('crm-phone').fill('555-0199');
 await page.getByTestId('crm-description').fill('Browser automation test');
 await page.getByTestId('crm-date').fill('2026-10-20');
 await page.getByTestId('crm-save').click();
 await expect(page.getByTestId('crm-status')).toContainText('saved');
 await expect(page.getByTestId('crm-row-E2E-001')).toContainText('Playwright Synthetic');
 await page.reload();
 await expect(page.getByTestId('crm-row-E2E-001')).toBeVisible();
});
test('synthetic CRM rejects duplicate IDs',async({page})=>{
 await page.goto('/demo-crm');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await page.getByTestId('crm-recordId').fill('demo-001');
 await page.getByTestId('crm-customerName').fill('Duplicate Example');
 await page.getByTestId('crm-description').fill('Should be rejected');
 await page.getByTestId('crm-date').fill('2026-10-20');
 await page.getByTestId('crm-save').click();
 await expect(page.getByTestId('crm-status')).toContainText('already exists');
});
