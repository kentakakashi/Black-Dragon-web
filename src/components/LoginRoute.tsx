import {useEffect,useState,type ReactNode} from "react";
import {Link} from "react-router-dom";
import {LockKeyhole,LogIn} from "lucide-react";
export function LoginRoute({children}:{children:ReactNode}){
 const [state,setState]=useState<"checking"|"allowed"|"signed-out"|"error">("checking");
 useEffect(()=>{let live=true;fetch("/.netlify/functions/account-session",{cache:"no-store"}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error();if(live)setState(d.user?"allowed":"signed-out");}).catch(()=>{if(live)setState("error");});return()=>{live=false;};},[]);
 if(state==="allowed")return <>{children}</>;
 return <main className="inner-page"><section className="section-pad" style={{minHeight:"65vh",display:"grid",placeItems:"center"}}><div style={{maxWidth:560,padding:32,textAlign:"center",border:"1px solid #765a3d66",background:"#111115"}}>{state==="checking"?<LockKeyhole size={32}/>:<LogIn size={32}/>}<h1 style={{fontFamily:"Barlow Condensed",fontSize:42,color:"#d7a65d"}}>{state==="checking"?"CHECKING YOUR IDENTITY":"DISCORD SIGN-IN REQUIRED"}</h1><p style={{color:"#aaa",lineHeight:1.8}}>{state==="error"?"The account service is temporarily unavailable.":state==="checking"?"Confirming your Discord session.":"Sign in with Discord to view member profiles and personal account information."}</p><a className="button button-primary" href="/.netlify/functions/discord-login-start">CONTINUE WITH DISCORD</a><p><Link to="/members" style={{color:"#d7b77e"}}>BACK TO MEMBER DIRECTORY</Link></p></div></section></main>;
}