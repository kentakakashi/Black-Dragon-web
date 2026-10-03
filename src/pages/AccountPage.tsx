import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, LogIn, LogOut, ShieldCheck, UserRound, Wifi } from "lucide-react";
import { GlareHover } from "../components/GlareHover";
import { ScrollReveal } from "../components/ScrollReveal";
import "./AccountPage.css";
import { MemberProgressionPanel } from "./MemberProgressionPanel";

type AccountUser = { id:string; username:string; globalName:string|null; avatar:string|null; roles:string[]; };
type SessionState = "loading"|"signed-out"|"signed-in"|"setup"|"error";

export function AccountPage() {
  const [user,setUser] = useState<AccountUser|null>(null);
  const [state,setState] = useState<SessionState>("loading");
  const [busy,setBusy] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const authError = params.get("auth");

  useEffect(() => {
    let active = true;
    fetch("/.netlify/functions/account-session", { credentials:"same-origin", cache:"no-store" })
      .then(async response => {
        if (response.status === 503) throw new Error("setup");
        if (!response.ok) throw new Error("request");
        return response.json();
      })
      .then(data => {
        if (!active) return;
        setUser(data.user || null);
        setState(data.user ? "signed-in" : "signed-out");
      })
      .catch((error:Error) => { if(active) setState(error.message === "setup" ? "setup" : "error"); });
    return () => { active = false; };
  }, []);

  async function signOut() {
    setBusy(true);
    try {
      const response = await fetch("/.netlify/functions/account-session", { method:"POST", credentials:"same-origin" });
      if (!response.ok) throw new Error("Sign out failed.");
      window.location.assign("/");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  }

  const avatar = user?.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : null;

  return <main className="account-page">
    <section className="account-hero">
      <div className="section-kicker"><span className="account-live-dot"/> MEMBER HEADQUARTERS / IDENTITY GATEWAY</div>
      <h1>YOUR PLACE IN<br/><em>THE LEGACY.</em></h1>
      <p>One identity. Your verified record. Everything you've earned with BLACK DRAGONS, in one place.</p>
      <div className="account-hero-stamp"><ShieldCheck size={43}/><span>SECURE MEMBER<br/>ACCESS</span></div>
    </section>
    <section className="account-content">
      <ScrollReveal>
        <GlareHover width="100%" height="100%" background="#111115" borderRadius="5px" borderColor="#5b432d" glareColor="#d7a65d" glareOpacity={0.18} glareSize={190} className="account-gateway">
          <div className="account-gateway-inner">
            <div className="account-gateway-top"><span className="section-kicker">01 / YOUR ACCOUNT</span><span className="account-secure"><Wifi size={13}/> SECURE CONNECTION</span></div>
            {state === "loading" && <div className="account-state"><div className="account-loader"/><h2>CHECKING YOUR<br/><em>IDENTITY.</em></h2><p>Connecting to the BLACK DRAGONS account gateway…</p></div>}
            {state === "signed-out" && <div className="account-state"><div className="account-big-icon"><LogIn size={29}/></div><h2>ENTER THE<br/><em>HEADQUARTERS.</em></h2><p>Sign in with Discord to access your personal website profile and applications. Signing in does not automatically make you a BLACK DRAGONS member.</p><a className="button button-primary account-login" href="/.netlify/functions/discord-login-start">CONTINUE WITH DISCORD <ArrowRight size={16}/></a><small className="account-privacy">We never ask for your Discord password. Authentication happens on Discord.</small></div>}
            {state === "signed-in" && user && <div className="account-state account-signed-in">
              <div className="account-big-icon"><BadgeCheck size={29}/></div><div className="section-kicker">IDENTITY VERIFIED</div>
              <h2>WELCOME BACK,<br/><em>{user.globalName || user.username}.</em></h2>
              <div className="account-identity"><div className="account-avatar">{avatar ? <img src={avatar} alt="Discord avatar"/> : <UserRound size={30}/>}</div><div><strong>{user.username}</strong><small>DISCORD ACCOUNT · ID {user.id}</small></div><span className="account-verified"><BadgeCheck size={15}/> VERIFIED</span></div>
              <div className="account-next-grid"><div><span>DISCORD CONNECTION</span><strong>ACTIVE</strong></div><div><span>ROBLOX ID</span><strong>BOT-SYNCED</strong></div></div>
              <p>Your Discord identity is connected. Your Roblox ID is managed through authorised Discord bot commands, while rank and kill records remain synced from the bot database.</p>
              <button className="button button-quiet account-logout" onClick={signOut} disabled={busy}><LogOut size={15}/>{busy?"SIGNING OUT…":"SIGN OUT"}</button>
            </div>}
            {state === "setup" && <div className="account-state"><div className="account-big-icon"><ShieldCheck size={29}/></div><h2>GATEWAY<br/><em>PREPARATION.</em></h2><p>Discord sign-in is built, but the secure Netlify environment settings still need to be added before members can authenticate.</p><div className="account-setup-list"><span>DISCORD OAUTH APPLICATION</span><span>SECURE DISCORD IDENTITY SYNC</span><span>SESSION SIGNING SECRET</span></div></div>}
            {state === "error" && <div className="account-state"><div className="account-big-icon"><ShieldCheck size={29}/></div><h2>CONNECTION<br/><em>INTERRUPTED.</em></h2><p>The account gateway could not be reached. Please refresh and try again.</p><button className="button button-quiet" onClick={()=>window.location.reload()}>RETRY CONNECTION</button></div>}
            {authError && <div className="account-auth-error" role="status">{authError === "denied" ? "Discord authorisation was cancelled." : authError === "not_member" ? "Discord sign-in could not be completed." : "Sign-in could not be completed. Please try again."}</div>}
          </div>
        </GlareHover>
      </ScrollReveal>
      {state === "signed-in" && <section className="section-pad" style={{maxWidth:1240,margin:"0 auto"}}><MemberProgressionPanel /></section>}
      <div className="account-side">
        <div className="section-kicker">02 / WHAT COMES NEXT</div>
        <h2>YOUR JOURNEY.<br/><em>YOUR RECORD.</em></h2>
        <div className="account-feature"><span>01</span><div><strong>ROBLOX ID SYNC</strong><p>Your Roblox ID is attached to your Discord identity by authorised staff through the official bot.</p></div></div>
        <div className="account-feature"><span>02</span><div><strong>PLAYER PROFILE</strong><p>Your verified rank, kills, achievements and membership details.</p></div></div>
        <div className="account-feature"><span>03</span><div><strong>PROGRESSION TIMELINE</strong><p>Track rank changes, milestones, events and recognition over time.</p></div></div>
        <div className="account-feature"><span>04</span><div><strong>APPLICATIONS</strong><p>Submit applications and follow their review status from your account.</p></div></div>
        <Link className="text-link" to="/applications">OPEN RECRUITMENT PORTAL <ArrowRight size={15}/></Link>
        <Link className="text-link" to="/ranks">EXPLORE THE RANK SYSTEM <ArrowRight size={15}/></Link>
      </div>
    </section>
  </main>;
}
