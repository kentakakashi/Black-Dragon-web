import {useEffect,useState, type ReactNode} from "react";
import {Link} from "react-router-dom";
import {LockKeyhole,ShieldCheck} from "lucide-react";
export function StaffRoute({children}:{children:ReactNode}){
 const [state,setState]=useState<"checking"|"allowed"|"denied"|"error">("checking");
 useEffect(()=>{let live=true;fetch("/.netlify/functions/staff-status",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error();if(live)setState(d.isStaff?"allowed":"denied");}).catch(()=>{if(live)setState("error");});return()=>{live=false;};},[]);
 if(state==="allowed")return <>{children}</>;
 return <main className="inner-page"><section className="section-pad" style={{minHeight:"65vh",display:"grid",placeItems:"center"}}><div style={{maxWidth:560,padding:32,textAlign:"center",border:"1px solid #765a3d66",background:"#111115"}}>{state==="checking"?<LockKeyhole size={32}/>:<ShieldCheck size={32}/>}<h1 style={{fontFamily:"Barlow Condensed",fontSize:42,color:"#d7a65d"}}>{state==="checking"?"VERIFYING ACCESS":"STAFF ACCESS REQUIRED"}</h1><p style={{color:"#aaa",lineHeight:1.8}}>{state==="checking"?"Checking your current website staff permissions.":state==="error"?"The staff access service is unavailable. Please try again.":"This administration workspace is restricted to authorised BLACK DRAGONS staff. Signing in alone does not grant staff access."}</p><Link className="button button-quiet" to="/account">ACCOUNT GATEWAY</Link></div></section></main>;
}