'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {DEMO_STORAGE_KEY,SEED_RECORDS,saveDemoRecord,isDemoRecord,type DemoRecord} from '@/lib/demo-crm';
import type {SourceRecord} from '@/lib/records';
const EMPTY:SourceRecord={recordId:'',customerName:'',email:'',phone:'',description:'',date:''};
const FIELDS=Object.keys(EMPTY) as (keyof SourceRecord)[];
export default function DemoCrm(){
 const [records,setRecords]=useState<DemoRecord[]>(SEED_RECORDS);
 const [form,setForm]=useState<SourceRecord>(EMPTY);
 const [query,setQuery]=useState('');
 const [message,setMessage]=useState('');
 const [ready,setReady]=useState(false);
 useEffect(()=>{try{const stored=localStorage.getItem(DEMO_STORAGE_KEY);if(stored){const parsed:unknown=JSON.parse(stored);if(Array.isArray(parsed)&&parsed.length<=1000&&parsed.every(isDemoRecord))setRecords(parsed);}}catch{/* Ignore invalid local demo state */}setReady(true);},[]);
 function persist(next:DemoRecord[]){setRecords(next);try{localStorage.setItem(DEMO_STORAGE_KEY,JSON.stringify(next));}catch{setMessage('Browser storage unavailable. Changes last only until refresh.');}}
 function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setMessage('');try{persist(saveDemoRecord(form,records,new Date().toISOString()));setForm(EMPTY);setMessage('Demo record saved in this browser.');}catch(e){setMessage(e instanceof Error?e.message:'Could not save record');}}
 const visible=records.filter(row=>[row.recordId,row.customerName,row.description].some(value=>value.toLowerCase().includes(query.toLowerCase())));
 return <main><Link href="/">← Home</Link><h1>Fictional Demo CRM</h1><p>This is a browser-only test target for FlowBridge AI. Use synthetic information only. No account, server database, or external client portal is connected.</p>
 <section className="panel"><h2>Create a demo record</h2><form onSubmit={submit} data-testid="demo-crm-form"><div className="grid">{FIELDS.map(field=><label key={field} style={{display:'grid',gap:8}}>{field}{['recordId','customerName','description','date'].includes(field)?' *':''}{field==='description'?<textarea data-testid={'crm-'+field} value={form[field]} onChange={e=>setForm(previous=>({...previous,[field]:e.target.value}))}/>:<input data-testid={'crm-'+field} type={field==='date'?'date':field==='email'?'email':'text'} value={form[field]} onChange={e=>setForm(previous=>({...previous,[field]:e.target.value}))}/>}</label>)}</div><p><button type="submit" data-testid="crm-save">Save demo record</button></p></form><p role="status" data-testid="crm-status">{message}</p></section>
 <section className="panel"><h2>Saved demo records ({records.length})</h2><label>Search records <input aria-label="Search demo records" value={query} onChange={e=>setQuery(e.target.value)}/></label><p><button type="button" disabled={!ready} onClick={()=>{persist(SEED_RECORDS);setMessage('Demo records reset.');}}>Reset fictional data</button></p><div style={{overflowX:'auto'}}><table cellPadding="10"><thead><tr><th>Record ID</th><th>Customer</th><th>Description</th><th>Date</th></tr></thead><tbody>{visible.map(record=><tr data-testid={'crm-row-'+record.recordId} key={record.recordId}><td>{record.recordId}</td><td>{record.customerName}</td><td>{record.description}</td><td>{record.date}</td></tr>)}</tbody></table></div>{!visible.length&&<p>No matching records.</p>}</section><p>Data stays in this browser local storage, not on a server. Do not enter personal, confidential, or production information.</p></main>;
}
