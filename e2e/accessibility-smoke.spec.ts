import {test,expect} from '@playwright/test';

const routes=['/','/import','/demo-crm','/history'];
for(const route of routes){
 test(`accessibility smoke: ${route}`,async({page})=>{
  await page.goto(route);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  const issues=await page.evaluate(()=>{
   const visible=(element:Element)=>{const style=getComputedStyle(element);return style.display!=='none'&&style.visibility!=='hidden'};
   const problems:string[]=[];
   for(const el of document.querySelectorAll('input,select,textarea')){
    if(!visible(el)||el.getAttribute('type')==='hidden')continue;
    const id=el.getAttribute('id');
    const labelled=!!(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||(id&&document.querySelector(`label[for="${CSS.escape(id)}"]`))||el.closest('label'));
    if(!labelled)problems.push(`Unlabelled field: ${el.outerHTML.slice(0,100)}`);
   }
   for(const img of document.querySelectorAll('img'))if(!img.hasAttribute('alt'))problems.push('Image missing alt');
   for(const button of document.querySelectorAll('button')){
    if(!visible(button))continue;
    const named=!!(button.textContent?.trim()||button.getAttribute('aria-label')||button.getAttribute('aria-labelledby'));
    if(!named)problems.push('Button missing accessible name');
   }
   return problems;
  });
  expect(issues).toEqual([]);
 });
}

test('keyboard navigation reaches Smart Import from homepage',async({page})=>{
 await page.goto('/');
 await page.keyboard.press('Tab');
 let found=false;
 for(let i=0;i<15;i++){
  const focused=await page.evaluate(()=>({tag:document.activeElement?.tagName,text:document.activeElement?.textContent??''}));
  if(focused.tag==='A'&&focused.text.includes('Open Smart Import')){found=true;break;}
  await page.keyboard.press('Tab');
 }
 expect(found).toBe(true);
 await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/import$/);
 await expect(page.getByRole('heading',{name:'Smart Import'})).toBeVisible();
});
