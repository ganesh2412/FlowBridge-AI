'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {EXECUTION_HISTORY_KEY,readExecutionHistory,type ExecutionEntry} from '@/lib/execution-history';
import {exportExecutionCsv} from '@/lib/execution-report';
export default function HistoryPage(){
 const [history,setHistory]=useState<ExecutionEntry[]>([]);
 const [error,setError]=useState('');
 useEffect(()=>{try{setHistory(readExecutionHistory(localStorage.getItem(EXECUTION_HISTORY_KEY)));}catch(e){setError(e instanceof Error?e.message:'Unable to read execution history');}},[]);
 function clear(){if(!window.confirm('Clear browser-local execution history? Demo CRM records will be preserved.'))return;localStorage.removeItem(EXECUTION_HISTORY_KEY);setHistory([]);setError('');}
 function download(entry:ExecutionEntry){const blob=new Blob([exportExecutionCsv(entry.outcomes,entry.executedAt)],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='flowbridge-history-'+entry.executedAt.replace(/[:.]/g,'-')+'.csv';a.click();URL.revokeObjectURL(url);}
 return <main><Link href="/">← Home</Link><h1>Execution history</h1><p>Up to 20 recent synthetic transfers stored in this browser only. No server storage or live RPA executions.</p>{error&&<p role="alert">{error}</p>}
 <div className="page-toolbar"><span className="muted-note">{history.length} saved execution{history.length===1?'':'s'} · newest first</span><button type="button" onClick={clear} disabled={!history.length&&!error}>Clear execution history</button></div>
 {!history.length&&!error&&<p>No executions saved yet. <Link href="/import">Run a synthetic import →</Link></p>}
 {history.map(entry=><section className="panel" key={entry.id}><div className="run-heading"><h2>{entry.sourceFile}</h2><span className="run-date">{new Date(entry.executedAt).toLocaleString()} · local time</span></div><div className="grid"><div className="metric-card"><div className="metric-label">Total records</div><div className="metric-value">{entry.summary.total}</div></div><div className="metric-card"><div className="metric-label">Saved</div><div className="metric-value good">{entry.summary.saved}</div></div><div className="metric-card"><div className="metric-label">Skipped</div><div className="metric-value warn">{entry.summary.skipped}</div></div><div className="metric-card"><div className="metric-label">Success rate</div><div className="metric-value">{entry.summary.successRate}%</div></div></div><div className="run-actions"><button type="button" onClick={()=>download(entry)}>Download report</button><span className="muted-note">Stored only in this browser</span></div><details><summary>Record-level outcomes</summary><div style={{overflowX:'auto'}}><table cellPadding="10"><thead><tr><th>Row</th><th>Record ID</th><th>Status</th><th>Reason</th></tr></thead><tbody>{entry.outcomes.map(item=><tr key={item.row}><td>{item.row}</td><td>{item.recordId}</td><td>{item.status}</td><td>{item.reason||'Saved to Demo CRM'}</td></tr>)}</tbody></table></div></details></section>)}</main>;
}
