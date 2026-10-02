import { useEffect, useState } from "react";
import { BadgeCheck, Check, Copy, ExternalLink, Gamepad2, X } from "lucide-react";
import { GlareHover } from "../components/GlareHover";
import { ScrollReveal } from "../components/ScrollReveal";

type Data={linked:boolean;roblox:{id:string;username:string}|null;pending:{username:string;code:string;expiresAt:number}|null;player:{rank:string;kills:number}|null};
export function RobloxLinkPanel(){
  const [data,setData]=useState<Data|null>(null);
  const [username,setUsername]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [copied,setCopied]=useState(false);
  async function refresh(){const r=await fetch("/.netlify/functions/roblox-link",{credentials:"same-origin",cache:"no-store"});if(!r.ok)throw new Error("The member profile service is not configured yet.");setData(await r.json());}
  useEffect(()=>{refresh().catch(e=>setError(e.message));},[]);
  async function act(action:"start"|"verify"|"cancel"){
    setBusy(true);setError("");setMessage("");
    try{const r=await fetch("/.netlify/functions/roblox-link",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,username})});const result=await r.json();if(!r.ok)throw new Error(result.error||"Request failed.");setMessage(action==="start"?"Code generated. Add it to your Roblox profile description.":action==="verify"?"Roblox ownership verified. Your accounts are now linked.":"Pending verification cancelled.");await refresh();}
    catch(e){setError(e instanceof Error?e.message:"Something went wrong.");}finally{setBusy(false);}
  }
  async function copy(){if(!data?.pending)return;try{await navigator.clipboard.writeText(data.pending.code);setCopied(true);}catch{setError("Copy failed. Select the code and copy it manually.");}}
  return <ScrollReveal><div className="account-content" style={{display:"block",paddingTop:0}}>
    <GlareHover width="100%" height="100%" background="#101115" borderRadius="5px" borderColor="#765a3d" glareColor="#d7a65d" glareOpacity={0.13} glareSize={180} className="account-gateway account-roblox-panel">
      <div className="account-gateway-inner">
        <div className="account-gateway-top"><span className="section-kicker">02 / ROBLOX OWNERSHIP</span><span className="account-secure"><Gamepad2 size={14}/> IDENTITY LINK</span></div>
        {data?.linked&&data.roblox?<div className="account-state"><div className="account-big-icon"><BadgeCheck size={29}/></div><div className="section-kicker">OWNERSHIP PROVEN</div><h2>ROBLOX<br/><em>{data.roblox.username}</em></h2><p>This account was linked using a one-time code verified against the public Roblox profile description.</p><a className="text-link" href={"https://www.roblox.com/users/"+data.roblox.id+"/profile"} target="_blank" rel="noreferrer">VIEW ROBLOX PROFILE <ExternalLink size={14}/></a></div>
        :<div className="account-link-flow"><div className="section-kicker">PROVE YOU OWN THE ACCOUNT</div><h2>LINK YOUR<br/><em>ROBLOX.</em></h2><p>Enter your exact Roblox username. We'll generate a temporary code. Add it to your Roblox profile description, save it, then verify here.</p>
          {!data?.pending&&<div className="account-link-form"><input value={username} onChange={e=>setUsername(e.target.value)} maxLength={20} placeholder="Your Roblox username" aria-label="Roblox username"/><button className="button button-primary" disabled={busy||username.trim().length<3} onClick={()=>act("start")}>{busy?"PLEASE WAIT…":"GENERATE CODE"}</button></div>}
          {data?.pending&&<div className="account-challenge"><span className="section-kicker">YOUR TEMPORARY VERIFICATION CODE</span><div className="account-code">{data.pending.code}</div><button className="button button-quiet" onClick={copy}><Copy size={14}/>{copied?"COPIED":"COPY CODE"}</button><ol><li>Open your <a href={"https://www.roblox.com/users/"+data.pending.id+"/profile"} target="_blank" rel="noreferrer">Roblox profile <ExternalLink size={12}/></a>.</li><li>Edit your profile description and add the code above.</li><li>Save it, return here and press Verify ownership.</li></ol><div className="account-challenge-actions"><button className="button button-primary" disabled={busy} onClick={()=>act("verify")}><Check size={15}/> VERIFY OWNERSHIP</button><button className="button button-quiet" disabled={busy} onClick={()=>act("cancel")}><X size={15}/> CANCEL</button></div><small>Expires {new Date(data.pending.expiresAt).toLocaleTimeString()}. Remove the code from your description after verification.</small></div>}
        </div>}
        {error&&<p className="account-link-error" role="alert">{error}</p>}{message&&<p className="account-link-success" role="status">{message}</p>}
        <div className="account-gateway-top" style={{marginTop:28}}><span className="section-kicker">03 / OFFICIAL PLAYER RECORD</span><span className="account-secure">BOT DATABASE</span></div>
        {data?.player?<div className="account-player-stats"><div className="account-stat"><span>CURRENT RANK</span><strong>{data.player.rank}</strong></div><div className="account-stat"><span>VERIFIED KILLS</span><strong>{data.player.kills.toLocaleString("en-US")}</strong></div><p>Read directly from the existing bot database. These values cannot be edited from the website.</p></div>:<p className="account-link-flow">Your verified player record will appear here when one exists and Firebase is connected.</p>}
      </div>
    </GlareHover>
  </div></ScrollReveal>;
}
