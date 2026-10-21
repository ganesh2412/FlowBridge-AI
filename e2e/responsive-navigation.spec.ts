import {test,expect} from '@playwright/test';

const viewports=[
 {name:'mobile',width:375,height:812},
 {name:'tablet',width:768,height:1024},
 {name:'desktop',width:1440,height:900},
];

for(const viewport of viewports){
 test(`navigation and layout remain usable on ${viewport.name}`,async({page})=>{
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'FlowBridge AI'})).toBeVisible();
  await expect(page.getByText('PUBLIC PORTFOLIO DEMO · SYNTHETIC DATA ONLY')).toBeVisible();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
  expect(overflow,'Homepage must not overflow horizontally').toBe(false);
  await page.getByRole('link',{name:/Open Smart Import/}).click();
  await expect(page.getByRole('heading',{name:'Smart Import'})).toBeVisible();
  await expect(page.locator('input[type="file"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
  await page.getByRole('link',{name:/Home/}).click();
  await page.getByRole('link',{name:/Open Demo CRM/}).click();
  await expect(page.getByRole('heading',{name:/Demo CRM/i})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
  await page.getByRole('link',{name:/Home/}).click();
  await page.getByRole('link',{name:/Open Execution History/}).click();
  await expect(page.getByRole('heading',{name:'Execution history'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
 });
}
