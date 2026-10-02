import {useEffect,useMemo,useState} from "react";
import {Search,ShieldCheck,Clock3,RefreshCw,ClipboardList,UserRound,ArrowUpRight} from "lucide-react";
import {Link} from "react-router-dom";
import {ScrollReveal} from "../components/ScrollReveal";
import "./AuditLogPage.css";
type AuditEntry={id:string;action:string;createdAt:number;actorDiscordId:string;targetDiscordId:string;status:string;referenceId:string};
type LoadState="loading"|"ready"|"denied"|"error";
function label(value:string){return value.replace(/_/g," ").toUpperCase();}
export function AuditLogPage(){
 const [entries,setEntries]=useState<AuditEntry[]>([]),[state,setState]=useState<LoadState>("loading"),[query,setQuery]=useState(""),[action,setAction]=useState("all"),[refreshing,setRefreshing]=useState(false);
 async function load(){setRefreshing(true);try{const response=await fetch("/.netlify/functions/admin-audit-logs",{credentials:"same-origin",cache:"no-store"});if(response.status===401||response.status===403){setState("denied");setEntries([]);return;}const data=await response.json();if(!response.ok)throw Error(data.error||"Unable to load audit records.");setEntries(data.entries||[]);setState("ready");}catch{setState("error");}finally{setRefreshing(false);}}
 useEffect(()=>{void load();},[]);
 const actions=useMemo(()=>Array.from(new Set(entries.map(item=>item.action))).sort(),[entries]);
 const filtered=useMemo(()=>entries.filter(item=>(action==="all"||item.action===action)&&[item.action,item.actorDiscordId,item.targetDiscordId,item.status,item.referenceId].join(" ").toLowerCase().includes(query.trim().toLowerCase())),[entries,action,query]);
 return <main className="inner-page audit-page">
  <section className="page-hero public-page-hero"><div className="section-kicker">STAFF ONLY / SECURITY & ACCOUNTABILITY</div><h1>THE AUDIT<br/><em>ARCHIVE.</em></h1><p>A read-only record of administrative actions across the BLACK DRAGONS website.</p></section>
  <section className="section-pad audit-content">
   <div className="audit-heading"><div><span className="section-kicker">01 / STAFF OVERSIGHT</span><h2>EVERY ACTION.<br/><em>ON RECORD.</em></h2></div><button className="button button-quiet" onClick={()=>void load()} disabled={refreshing}><RefreshCw size={14}/>{refreshing?"UPDATING…":"REFRESH LOG"}</button></div>
   {state==="loading"?<div className="leader-empty large-empty">Verifying staff access and retrieving audit records…</div>:state==="denied"?<div className="audit-state"><ShieldCheck/><h3>STAFF ACCESS REQUIRED.</h3><p>This archive is restricted to current Discord staff with the configured dashboard role.</p><Link className="text-link" to="/admin">RETURN TO COMMAND CENTRE <ArrowUpRight size={14}/></Link></div>:state==="error"?<div className="audit-state"><ShieldCheck/><h3>AUDIT ARCHIVE UNAVAILABLE.</h3><p>We couldn't retrieve the audit records. Check the staff configuration and try again.</p><button className="button button-quiet" onClick={()=>void load()}>TRY AGAIN</button></div>:<>
    <div className="audit-summary"><div><ClipboardList/><strong>{filtered.length}</strong><span>VISIBLE RECORDS</span></div><div><Clock3/><strong>{entries.length?new Date(entries[0].createdAt).toLocaleDateString():"—"}</strong><span>MOST RECENT ACTIVITY</span></div><div><ShieldCheck/><strong>READ ONLY</strong><span>NO RECORDS CAN BE EDITED HERE</span></div></div>
    <div className="audit-controls"><label className="audit-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search actions or Discord IDs…" aria-label="Search audit logs"/></label><label className="audit-filter">ACTION<select value={action} onChange={e=>setAction(e.target.value)}><option value="all">All actions</option>{actions.map(value=><option key={value} value={value}>{label(value)}</option>)}</select></label></div>
    <div className="audit-list">{filtered.length?filtered.map((item,index)=><ScrollReveal key={item.id}><article className="audit-record"><div className="audit-record-index">{String(index+1).padStart(3,"0")}</div><div className="audit-record-main"><div className="audit-record-top"><span className="audit-action">{label(item.action)}</span><time>{new Date(item.createdAt).toLocaleString()}</time></div><div className="audit-record-meta">{item.actorDiscordId&&<span><UserRound size={13}/> ACTOR · {item.actorDiscordId}</span>}{item.targetDiscordId&&<span>TARGET · {item.targetDiscordId}</span>}{item.status&&<span>STATUS · {label(item.status)}</span>}{item.referenceId&&<span>REF · {item.referenceId}</span>}</div></div></article></ScrollReveal>):<div className="audit-state"><ClipboardList/><h3>NO MATCHING RECORDS.</h3><p>Try a different search or action filter.</p></div>}</div>
    <p className="audit-footnote">Showing up to 200 recent records. Sensitive applicant answers, feedback, credentials and private registration details are intentionally excluded.</p>
   </>}
  </section>
 </main>;
}
