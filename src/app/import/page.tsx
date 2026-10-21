'use client';
import Link from 'next/link';
import {useState} from 'react';
import {parseSpreadsheet} from '@/lib/spreadsheet';
import {validateRows,type ValidationResult} from '@/lib/records';
import {DEMO_STORAGE_KEY,SEED_RECORDS,isDemoRecord} from '@/lib/demo-crm';
import {summarizeExecution,exportExecutionCsv} from '@/lib/execution-report';
import {EXECUTION_HISTORY_KEY,readExecutionHistory,appendExecutionHistory,makeExecutionEntry} from '@/lib/execution-history';
import {transferValidatedRows,type TransferOutcome} from '@/lib/transfer';
import {TARGET_FIELDS,suggestMapping,validateMapping,applyMapping,type FieldMapping} from '@/lib/mapping';
const EMPTY_MAPPING=Object.fromEntries(TARGET_FIELDS.map(field=>[field,''])) as FieldMapping;
export default function ImportPage(){
 const [rawRows,setRawRows]=useState<Record<string,unknown>[]>([]);
 const [headers,setHeaders]=useState<string[]>([]);
 const [mapping,setMapping]=useState<FieldMapping>(EMPTY_MAPPING);
 const [error,setError]=useState('');
 const [name,setName]=useState('');
 const [outcomes,setOutcomes]=useState<TransferOutcome[]>([]);
 const [executedAt,setExecutedAt]=useState('');
 const [transferMessage,setTransferMessage]=useState('');
 const mappingErrors=validateMapping(mapping);
 const results:ValidationResult[]=rawRows.length&&!mappingErrors.length?validateRows(applyMapping(rawRows,mapping)):[];
 const summary=summarizeExecution(outcomes);
 function downloadReport(){const blob=new Blob([exportExecutionCsv(outcomes,executedAt)],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='flowbridge-execution-report.csv';anchor.click();URL.revokeObjectURL(url);}
 const valid=results.filter(r=>!r.errors.length&&!r.duplicate).length;
 function transfer(){
  setTransferMessage('');setOutcomes([]);setExecutedAt('');
  if(!results.length||mappingErrors.length)return;
  try{
   const stored=localStorage.getItem(DEMO_STORAGE_KEY);
   const parsed:unknown=stored?JSON.parse(stored):SEED_RECORDS;
   if(!Array.isArray(parsed)||parsed.length>1000||!parsed.every(isDemoRecord))throw new Error('Existing demo storage is invalid. Reset it from the Demo CRM page.');
   const report=transferValidatedRows(results,parsed,new Date().toISOString());
   const timestamp=new Date().toISOString();
   const history=readExecutionHistory(localStorage.getItem(EXECUTION_HISTORY_KEY));
   const entry=makeExecutionEntry(name,report.outcomes,timestamp);
   localStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify(report.records));
   try{localStorage.setItem(EXECUTION_HISTORY_KEY,JSON.stringify(appendExecutionHistory(history,entry)));}catch{setTransferMessage('Transfer saved, but execution history could not be stored.');}
   setOutcomes(report.outcomes);setExecutedAt(timestamp);
   setTransferMessage('Transfer completed: '+report.outcomes.filter(item=>item.status==='saved').length+' saved, '+report.outcomes.filter(item=>item.status==='skipped').length+' skipped.');
  }catch(e){setTransferMessage(e instanceof Error?e.message:'Transfer failed. No changes confirmed.');}
 }
 async function load(file?:File){
  setRawRows([]);setHeaders([]);setMapping(EMPTY_MAPPING);setError('');setName('');setOutcomes([]);setExecutedAt('');setTransferMessage('');
  if(!file)return;
  if(!/\.(xlsx|csv)$/i.test(file.name)){setError('Only .xlsx and .csv files are supported');return;}
  if(file.size>2_000_000){setError('Maximum file size is 2 MB');return;}
  try{
   const {headers:foundHeaders,rows:data}=await parseSpreadsheet(file);
   setHeaders(foundHeaders);setMapping(suggestMapping(foundHeaders));setRawRows(data);setName(file.name);
  }catch(e){setError(e instanceof Error?e.message:'Unable to read spreadsheet');}
 }
 return <main><Link href="/">← Home</Link><h1>Smart Import</h1><p>Files are parsed in your browser and are never uploaded. You may optionally save validated synthetic records to the local Demo CRM. Maximum 2 MB / 1,000 rows.</p>
 <div className="panel"><label htmlFor="upload">Select an Excel or CSV file</label><p><input id="upload" type="file" accept=".xlsx,.csv" onChange={e=>void load(e.target.files?.[0])}/></p>{error&&<p role="alert">{error}</p>}</div>
 {rawRows.length>0&&<><section className="panel"><h2>Map source columns · {name}</h2><p>Choose which spreadsheet column fills each destination field. Required fields are marked *.</p><div className="grid">{TARGET_FIELDS.map(field=><label key={field} style={{display:'grid',gap:8}}>{field}{['recordId','customerName','description','date'].includes(field)?' *':''}<select aria-label={'Map '+field} value={mapping[field]} onChange={e=>setMapping(previous=>({...previous,[field]:e.target.value}))}><option value="">Not mapped</option>{headers.map(header=><option key={header} value={header}>{header}</option>)}</select></label>)}</div>{mappingErrors.length>0&&<div role="alert"><p>Resolve mapping issues:</p><ul>{mappingErrors.map(issue=><li key={issue}>{issue}</li>)}</ul></div>}</section>
 {results.length>0&&<><div className="grid"><div className="panel">Rows: {results.length}</div><div className="panel">Valid: {valid}</div><div className="panel">Invalid: {results.filter(r=>r.errors.length).length}</div><div className="panel">Duplicates: {results.filter(r=>r.duplicate).length}</div></div><section className="panel"><h2>Mapped record preview</h2><div style={{overflowX:'auto'}}><table cellPadding="10"><thead><tr><th>Row</th><th>Record ID</th><th>Customer</th><th>Status</th></tr></thead><tbody>{results.slice(0,100).map(r=><tr key={r.row}><td>{r.row}</td><td>{r.record.recordId}</td><td>{r.record.customerName}</td><td>{[...r.errors,...(r.duplicate?['Duplicate ID']:[])].join('; ')||'Valid'}</td></tr>)}</tbody></table></div><p>First 100 rows shown. Use synthetic data only. This is a browser-local transfer, not Playwright automation.</p><button type="button" onClick={transfer} data-testid="transfer-to-crm">Transfer valid rows to Demo CRM</button><p role="status" data-testid="transfer-status">{transferMessage}</p>{outcomes.length>0&&<><p><Link href="/demo-crm">Review Demo CRM →</Link> · <Link href="/history">Execution history →</Link></p><h3>Execution dashboard</h3><p data-testid="execution-timestamp">Executed at: {executedAt} (UTC)</p><div className="grid"><div className="panel">Total: {summary.total}</div><div className="panel">Saved: {summary.saved}</div><div className="panel">Skipped: {summary.skipped}</div><div className="panel">Success rate: {summary.successRate}%</div></div><p><button type="button" onClick={downloadReport} data-testid="download-execution-report">Download CSV execution report</button></p><h3>Per-record transfer results</h3><div style={{overflowX:'auto'}}><table cellPadding="10"><thead><tr><th>Row</th><th>Record ID</th><th>Result</th><th>Reason</th></tr></thead><tbody>{outcomes.map(item=><tr key={item.row}><td>{item.row}</td><td>{item.recordId}</td><td>{item.status}</td><td>{item.reason||'—'}</td></tr>)}</tbody></table></div></>}</section></>}</>}
 </main>;
}
