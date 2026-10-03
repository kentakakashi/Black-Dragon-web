import {useEffect,useState,type ReactNode} from "react";
import {ShieldCheck,LockKeyhole,ArrowUpRight,RefreshCw} from "lucide-react";

type GateState="checking"|"signed-in"|"signed-out"|"error";
export function EntryGate({children}:{children:ReactNode}){
 const [state,setState]=useState<GateState>("checking");
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  let active=true;
  setState("checking");
  fetch("/.netlify/functions/account-session",{credentials:"same-origin",cache:"no-store"})
   .then(async response=>{if(!response.ok)throw new Error("session");return response.json();})
   .then(data=>{if(active)setState(data.user?"signed-in":"signed-out");})
   .catch(()=>{if(active)setState("error");});
  return()=>{active=false;};
 },[retry]);
 if(state==="signed-in")return <>{children}</>;
 const auth=new URLSearchParams(window.location.search).get("auth");
 return <main className="entry-gate">
  <div className="entry-gate-grain"/>
  <div className="entry-gate-card">
   <div className="entry-gate-emblem"><span>BD</span></div>
   <span className="section-kicker">BLACK DRAGONS [BD] / SECURE ACCESS</span>
   <h1>{state==="checking"?"VERIFYING YOUR IDENTITY":state==="error"?"GATEWAY UNAVAILABLE":"THE GATEWAY."}</h1>
   <p>{state==="checking"?"Checking your saved Discord session. One moment.":state==="error"?"The account gateway could not be reached. Check your connection and try again.": "Sign in with Discord to enter the BLACK DRAGONS website. Your session will be remembered, so you won't need to sign in again while it remains valid."}</p>
   {state==="checking"?<div className="entry-gate-loader"><span/> SECURELY CHECKING SESSION</div>:state==="error"?<button className="button button-primary" onClick={()=>setRetry(x=>x+1)}><RefreshCw size={15}/> RETRY CONNECTION</button>:<a className="button button-primary entry-gate-login" href="/.netlify/functions/discord-login-start"><ShieldCheck size={16}/> CONTINUE WITH DISCORD <ArrowUpRight size={15}/></a>}
   {state==="signed-out"&&auth&&<small className="entry-gate-error">{auth==="denied"?"Discord authorisation was cancelled.": "The previous sign-in attempt did not complete. Please try again."}</small>}
   <small className="entry-gate-privacy"><LockKeyhole size={12}/> Authentication is handled by Discord. We never ask for your password.</small>
   <div className="entry-gate-footer">STRENGTH · LOYALTY · LEGACY</div>
  </div>
 </main>;
}
