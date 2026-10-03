import { useEffect, useState } from "react";
import { RefreshCw, Users, CheckCircle2, AlertTriangle, Clock3, ShieldCheck } from "lucide-react";

type ProfileRow = { discordId:string; username:string; displayName:string; avatar:string|null; syncedAt:number; status:"current"|"outdated"|"never" };
type MonitorData = { profiles:ProfileRow[]; totalKnown:number; profilesStored:number; missingSnapshots:number; current:number; outdated:number; neverSynced:number; syncResult?:{updated:number;checked:number;syncedAt:number}|null };
export function ProfileMonitorPage() {
  const [data,setData]=useState<MonitorData|null>(null);
  const [state,setState]=useState<"loading"|"ready"|"denied"|"error">("loading");
  const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function load(sync=false) {
    setBusy(true); setMessage("");
    try {
      const response=await fetch("/.netlify/functions/profile-monitor",{method:sync?"POST":"GET",credentials:"same-origin",cache:"no-store"});
      if(response.status===401||response.status===403){setState("denied");return;}
      if(!response.ok)throw new Error();
      const result=await response.json();setData(result);setState("ready");
      if(result.syncResult)setMessage("Sync complete: "+result.syncResult.updated+" known profiles refreshed from "+result.syncResult.checked+" Discord guild accounts.");
    } catch {setState("error");}
    finally {setBusy(false);}
  }
  useEffect(()=>{load();},[]);
  return <main className="inner-page">
    <section className="page-hero public-page-hero"><div className="section-kicker">STAFF ONLY / IDENTITY OPERATIONS</div><h1>PROFILE<br/><em>MONITOR.</em></h1><p>Track Discord identity snapshots and refresh profile information without touching verified game records.</p></section>
    <section className="section-pad" style={{maxWidth:1240,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:24}}>
        <div><div className="section-kicker">DISCORD IDENTITY SYNC</div><h2 style={{margin:"8px 0"}}>THE PROFILE <em>REGISTER.</em></h2></div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="button button-quiet" onClick={()=>load()} disabled={busy}><RefreshCw size={14}/> REFRESH</button><button className="button button-primary" onClick={()=>load(true)} disabled={busy}><RefreshCw size={14}/> {busy?"SYNCING…":"SYNC ALL PROFILES"}</button></div>
      </div>
      {state==="loading"&&<div className="leader-empty large-empty">Loading profile records…</div>}
      {state==="denied"&&<div className="leader-empty large-empty">Staff permission required to view profile monitoring.</div>}
      {state==="error"&&<div className="leader-empty large-empty">Profile monitoring is temporarily unavailable. Check the server configuration and try again.</div>}
      {state==="ready"&&data&&<>
        <div className="admin-metrics-grid">
          {[["KNOWN ACCOUNTS",data.totalKnown,Users],["CURRENT SNAPSHOTS",data.current,CheckCircle2],["OUTDATED",data.outdated,AlertTriangle],["NEVER SYNCED",data.neverSynced+data.missingSnapshots,Clock3]].map(([label,value,Icon]:any,i)=><article className="admin-metric-card" key={label}><div><Icon size={19}/><span>0{i+1} / PROFILES</span></div><strong>{Number(value).toLocaleString("en-US")}</strong><small>{label}</small></article>)}
        </div>
        {message&&<p className="admin-dashboard-note"><ShieldCheck size={15}/>{message}</p>}
        <div style={{overflowX:"auto",marginTop:28,border:"1px solid rgba(214,166,93,.2)",background:"#101014"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:620,textAlign:"left"}}>
            <thead><tr>{["DISCORD IDENTITY","SYNC STATUS","LAST SYNCED"].map(x=><th key={x} style={{padding:14,color:"#c99a59",fontSize:".7rem",letterSpacing:".12em",borderBottom:"1px solid rgba(214,166,93,.2)"}}>{x}</th>)}</tr></thead>
            <tbody>{data.profiles.map(profile=><tr key={profile.discordId} style={{borderBottom:"1px solid rgba(214,166,93,.12)"}}>
              <td style={{padding:12}}><div style={{display:"flex",alignItems:"center",gap:12}}>{profile.avatar?<img src={"https://cdn.discordapp.com/avatars/"+profile.discordId+"/"+profile.avatar+".png?size=64"} style={{width:38,height:38,borderRadius:"50%"}}/>:<span style={{width:38,height:38,borderRadius:"50%",background:"#292329"}}/>}<span><strong style={{display:"block",color:"#eee4d6"}}>{profile.displayName}</strong><small style={{color:"#aaa"}}>@{profile.username}</small></span></div></td>
              <td style={{padding:12,color:profile.status==="current"?"#9bc6a4":profile.status==="outdated"?"#d7a65d":"#d88b80"}}>{profile.status.toUpperCase()}</td>
              <td style={{padding:12,color:"#aaa"}}>{profile.syncedAt?new Date(profile.syncedAt).toLocaleString():"Not synced yet"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="admin-dashboard-note"><ShieldCheck size={15}/> Sync timestamps are staff-only. Public member profiles never display them. Rank and kills remain controlled by the bot database.</p>
      </>}
    </section>
  </main>;
}
