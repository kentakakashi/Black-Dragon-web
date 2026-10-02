import { ArrowUpRight, CheckCircle2, MessageCircle, ShieldCheck, Swords } from "lucide-react";
import { ParticleField } from "../components/ParticleField";
const invite = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/7C2uT3YX6E";
export function JoinPage() {
  return <main className="inner-page"><section className="page-hero join-page-hero"><ParticleField/><div className="section-kicker">YOUR STORY STARTS HERE</div><h1>RISE WITH<br/><em>THE DRAGONS.</em></h1><p>Bring your skill. Bring your discipline. Find your place in BLACK DRAGONS [BD].</p><div className="page-hero-mark"><ShieldCheck size={55}/><span>STRENGTH · LOYALTY · LEGACY</span></div></section>
    <section className="section-pad join-content"><div className="section-kicker">01 / ENTER THE COMMUNITY</div><h2>TAKE THE<br/><em>FIRST STEP.</em></h2><p className="join-lead">Our Discord is the home base for the community. Connect with members, follow announcements, and find out how to get involved.</p>
      <div className="join-steps"><article><span>01</span><MessageCircle/><h3>JOIN THE SERVER</h3><p>Enter the official BLACK DRAGONS Discord community.</p></article><article><span>02</span><CheckCircle2/><h3>GET TO KNOW BD</h3><p>Read the server information and understand the community standards.</p></article><article><span>03</span><Swords/><h3>PROVE YOURSELF</h3><p>Take part, improve your game, and earn your place.</p></article></div>
      {invite?<a className="button button-primary join-discord" href={invite} target="_blank" rel="noreferrer">OPEN THE DISCORD SERVER <ArrowUpRight size={18}/></a>:<div className="setup-note join-setup">Discord invite is not configured yet. Add VITE_DISCORD_INVITE_URL in the Netlify environment variables.</div>}
    </section></main>;
}
