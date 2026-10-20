import Papa from 'papaparse';
export type ParsedSpreadsheet={headers:string[];rows:Record<string,unknown>[]};
function assemble(matrix:unknown[][]):ParsedSpreadsheet{
 const headers=(matrix[0]??[]).map(value=>String(value??'').trim());
 if(!headers.length||headers.every(h=>!h))throw new Error('No column headers found');
 if(headers.some(h=>!h))throw new Error('Blank column headers found');
 if(new Set(headers).size!==headers.length)throw new Error('Duplicate column headers found');
 const populated=matrix.slice(1).filter(row=>row.some(value=>String(value??'').trim()!==''));
 for(const [index,row] of populated.entries())if(row.length>headers.length&&row.slice(headers.length).some(value=>String(value??'').trim()!==''))throw new Error('Row '+(index+2)+' has more values than column headers');
 const rows=populated.map(row=>Object.fromEntries(headers.map((header,index)=>[header,row[index]??''])));
 if(rows.length>1000)throw new Error('Maximum 1,000 rows per file');
 if(!rows.length)throw new Error('No records found');
 return {headers,rows};
}
export async function parseSpreadsheet(file:File):Promise<ParsedSpreadsheet>{
 if(file.name.toLowerCase().endsWith('.csv')){
  const result=Papa.parse<string[]>(await file.text(),{skipEmptyLines:'greedy'});
  if(result.errors.length)throw new Error('CSV parse error: '+result.errors[0].message);
  return assemble(result.data);
 }
 const ExcelJS=(await import('exceljs')).default;
 const workbook=new ExcelJS.Workbook();
 await workbook.xlsx.load(await file.arrayBuffer() as never);
 const sheet=workbook.worksheets[0];
 if(!sheet)throw new Error('No worksheet found');
 const matrix:unknown[][]=[];
 sheet.eachRow({includeEmpty:false},row=>{
  const values:unknown[]=[];
  row.eachCell({includeEmpty:true},(cell,col)=>{
   const v=cell.value;
   values[col-1]=v instanceof Date?v.toISOString().slice(0,10):typeof v==='object'&&v!==null?'':v??'';
  });
  matrix.push(values);
 });
 return assemble(matrix);
}
