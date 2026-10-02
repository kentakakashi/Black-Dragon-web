import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Bell, BookOpen, CheckCircle2, Crown, Flame, Medal, Search, Shield, ShieldCheck, Swords, Trophy, Users } from "lucide-react";
import { GlareHover } from "../components/GlareHover";
import { ParticleField } from "../components/ParticleField";
import { ScrollReveal } from "../components/ScrollReveal";

const invite = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/7C2uT3YX6E";

function PageHero({kicker,title,accent,copy,icon:Icon}:{kicker:string;title:string;accent:string;copy:string;icon:typeof Shield}) {
  return <section className="page-hero public-page-hero"><ParticleField/><div className="section-kicker">{kicker}</div><h1>{title}<br/><em>{accent}</em></h1><p>{copy}</p><div className="page-hero-mark"><Icon size={54}/><span>BLACK DRAGONS [BD]</span></div></section>;
}
function EmptyState({icon:Icon,title,copy}:{icon:typeof Bell;title:string;copy:string}) {
  return <GlareHover width="100%" height="100%" background="#101014" borderRadius="5px" borderColor="#4b3828" glareColor="#d7a65d" glareOpacity={0.2} glareSize={180} className="public-empty-glare">
    <div className="public-empty"><span className="public-empty-icon"><Icon size={27}/></span><span className="section-kicker">THE ARCHIVE IS QUIET</span><h3>{title}</h3><p>{copy}</p><a className="text-link" href={invite} target="_blank" rel="noreferrer">FOLLOW BD ON DISCORD <ArrowUpRight size={15}/></a></div>
  </GlareHover>;
}
function ContentCard({number,title,copy,icon:Icon}:{number:string;title:string;copy:string;icon:typeof Shield}) {
  return <ScrollReveal><GlareHover width="100%" height="100%" background="#111115" borderRadius="4px" borderColor="#302820" glareColor="#d7a65d" glareOpacity={0.16} glareSize={160} className="public-content-glare"><article className="public-content-card"><div className="public-card-top"><span>{number}</span><Icon size={21}/></div><h3>{title}</h3><p>{copy}</p></article></GlareHover></ScrollReveal>;
}

export function AnnouncementsPage() {
  return <main className="inner-page"><PageHero kicker="THE OFFICIAL WORD" title="FROM THE" accent="HEADQUARTERS." copy="Important notices, community updates and official BLACK DRAGONS announcements." icon={Bell}/><section className="section-pad public-listing"><div className="public-listing-head"><div><div className="section-kicker">01 / OFFICIAL NOTICES</div><h2>THE NOTICE<br/><em>BOARD.</em></h2></div><span className="public-count">0 PUBLISHED</span></div><EmptyState icon={Bell} title="No announcements just yet." copy="When the staff team publishes an official notice, it will appear here. Join the Discord to catch important updates in real time."/></section></main>;
}

export function NewsPage() {
  return <main className="inner-page"><PageHero kicker="THE STORIES THAT SHAPE US" title="BEYOND THE" accent="BATTLEFIELD." copy="Milestones, member spotlights, event recaps and stories from the BLACK DRAGONS community." icon={BookOpen}/><section className="section-pad public-listing"><div className="public-listing-head"><div><div className="section-kicker">01 / THE CHRONICLES</div><h2>THE BD<br/><em>JOURNAL.</em></h2></div><span className="public-count">0 STORIES</span></div><EmptyState icon={BookOpen} title="The first chapter is waiting." copy="The news desk is ready. Published stories and community spotlights will appear here as the team adds them."/></section><section className="section-pad public-pillars"><ContentCard number="01" title="BATTLE REPORTS" copy="Recaps and highlights from clan events and competitive moments." icon={Swords}/><ContentCard number="02" title="MEMBER SPOTLIGHTS" copy="Recognising the people whose effort helps shape the community." icon={Users}/><ContentCard number="03" title="MILESTONES" copy="Major achievements, rank milestones and moments worth remembering." icon={Trophy}/></section></main>;
}

const rules = [
  {n:"01",title:"RESPECT THE COMMUNITY",copy:"Treat members, staff, allies and opponents with respect. Harassment, targeted abuse, hate speech and impersonation have no place here.",icon:Users},
  {n:"02",title:"COMPETE FAIRLY",copy:"Play honestly. Exploits, cheating, fabricated kill records and attempts to manipulate progression undermine the competition.",icon:Swords},
  {n:"03",title:"PROTECT YOUR ACCOUNT",copy:"Never share passwords, authentication codes or private account details. Staff should not need your password to help you.",icon:ShieldCheck},
  {n:"04",title:"REPRESENT THE NAME",copy:"Keep public conduct and community spaces respectful. Follow Roblox and Discord platform rules alongside clan standards.",icon:Shield},
  {n:"05",title:"RESPECT STAFF PROCESSES",copy:"Use the designated Discord channels for support, applications and appeals. Verified rank and kill records are changed only through authorised review.",icon:CheckCircle2},
  {n:"06",title:"KEEP IT SAFE",copy:"Do not post personal information, threats, malicious links or content that puts another member at risk.",icon:ShieldCheck}
];
export function RulesPage() {
  return <main className="inner-page"><PageHero kicker="THE STANDARD WE SHARE" title="THE CODE" accent="OF THE DRAGON." copy="A community only stands strong when every member protects the standard." icon={Shield}/><section className="section-pad rules-content"><div className="section-kicker">01 / COMMUNITY STANDARDS</div><div className="rules-intro"><h2>RESPECT IS<br/><em>NON-NEGOTIABLE.</em></h2><p>These are the baseline standards for using this website and representing BLACK DRAGONS. The official server rules, detailed procedures and penalties are maintained by staff in Discord.</p></div><div className="public-pillars">{rules.map(rule=><ContentCard key={rule.n} number={rule.n} title={rule.title} copy={rule.copy} icon={rule.icon}/>)}</div><div className="rules-note"><ShieldCheck size={19}/><p><strong>Need clarification?</strong> Check the official Discord rules and ask staff before assuming an exception applies.</p><a href={invite} target="_blank" rel="noreferrer">OPEN DISCORD <ArrowUpRight size={14}/></a></div></section></main>;
}

type Member = {discordId:string;discordUsername:string;displayName:string;avatar:string|null;robloxUsername:string|null;kills:number;rank:string};
type MemberState = "loading"|"ready"|"setup"|"error";
export function MembersPage() {
 const [members,setMembers]=useState<Member[]>([]),[state,setState]=useState<MemberState>("loading"),[query,setQuery]=useState("");
 useEffect(()=>{let active=true;fetch("/.netlify/functions/members",{cache:"no-store"}).then(async r=>{if(r.status===503)throw new Error("setup");if(!r.ok)throw new Error("request");return r.json();}).then((d:{members?:Member[]})=>{if(active){setMembers(d.members||[]);setState("ready");}}).catch((e:Error)=>{if(active)setState(e.message==="setup"?"setup":"error");});return()=>{active=false;};},[]);
 const filtered=useMemo(()=>members.filter(m=>(m.displayName+" "+m.discordUsername+" "+(m.robloxUsername||"")).toLowerCase().includes(query.trim().toLowerCase())),[members,query]);
 return <main className="inner-page"><PageHero kicker="THE PEOPLE BEHIND THE EMBLEM" title="MEET THE" accent="DRAGONS." copy="Every member has a Discord identity. Explore the people, their verified Roblox links and the progression they've earned." icon={Users}/><section className="section-pad members-content"><div className="public-listing-head"><div><div className="section-kicker">01 / MEMBER DIRECTORY</div><h2>THE PEOPLE.<br/><em>THE PROOF.</em></h2></div><span className="public-count">{state==="ready"?members.length+" MEMBERS":"DIRECTORY "+state.toUpperCase()}</span></div><label className="member-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Discord or Roblox name..." aria-label="Search members by Discord or Roblox name"/></label>
 {state==="loading"?<div className="leader-empty large-empty">Loading Discord member profiles…</div>:state==="setup"?<EmptyState icon={Users} title="The directory is being connected." copy="Public Discord profiles will appear here after the secure member directory is configured."/>:state==="error"?<div className="leader-empty large-empty">The member directory could not load. Please try again later.</div>:filtered.length===0?<EmptyState icon={Users} title={members.length?"No matching members.":"No public member profiles yet."} copy={members.length?"Try another Discord or Roblox name.":"Members with an official BLACK DRAGONS player record will appear here after signing in once."}/>:<div className="members-grid">{filtered.map((m,index)=><ScrollReveal key={m.discordId}><Link to={"/members/"+m.discordId} className="member-profile-link"><GlareHover width="100%" height="100%" background="#111115" borderRadius="4px" borderColor="#302820" glareColor="#d7a65d" glareOpacity={0.17} glareSize={150} className="member-glare"><article className="member-card"><div className="member-card-top"><span>MEMBER / {String(index+1).padStart(3,"0")}</span><span className="member-rank">{m.rank}</span></div><div className="member-avatar">{m.avatar?<img src={m.avatar} alt={m.displayName+" Discord avatar"} loading="lazy"/>:<Users size={24}/>}</div><h3>{m.displayName}</h3><span className="member-discord-handle">@{m.discordUsername}</span>{m.robloxUsername&&<span className="member-roblox-name">ROBLOX · {m.robloxUsername}</span>}<div className="member-stat"><span>VERIFIED KILLS</span><strong>{Number(m.kills||0).toLocaleString("en-US")}</strong></div><span className="member-view-profile">VIEW MEMBER PROFILE <ArrowUpRight size={13}/></span></article></GlareHover></Link></ScrollReveal>)}</div>}</section></main>;
}

const staffRoles = [
  {name:"OWNER",copy:"Project ownership and final oversight.",icon:Crown},
  {name:"ADMINISTRATOR",copy:"Trusted staff responsible for core community operations.",icon:ShieldCheck},
  {name:"MODERATOR",copy:"Community safety, support and moderation.",icon:Shield},
  {name:"TRYOUT STAFF",copy:"Organising tryouts and helping evaluate participants.",icon:Swords},
  {name:"MEMBER",copy:"The people who make BLACK DRAGONS a community.",icon:Users}
];
export function StaffPage() {
  return <main className="inner-page"><PageHero kicker="THE PEOPLE WHO KEEP IT MOVING" title="THE HANDS" accent="BEHIND THE LEGACY." copy="Meet the roles that help BLACK DRAGONS stay organised, competitive and welcoming." icon={ShieldCheck}/><section className="section-pad staff-content"><div className="section-kicker">01 / STAFF STRUCTURE</div><div className="rules-intro"><h2>LEAD BY<br/><em>EXAMPLE.</em></h2><p>We will only publish named staff profiles after the official Discord role roster is connected and verified. No placeholder identities or invented staff members.</p></div><div className="public-pillars">{staffRoles.map((role,index)=><ContentCard key={role.name} number={"0"+(index+1)} title={role.name} copy={role.copy} icon={role.icon}/>)}</div><div className="rules-note"><Users size={19}/><p><strong>Interested in helping?</strong> Tryout staff and recruitment opportunities will be announced through the official community.</p><a href={invite} target="_blank" rel="noreferrer">VISIT DISCORD <ArrowUpRight size={14}/></a></div></section></main>;
}

export function HallOfFamePage() {
  return <main className="inner-page"><PageHero kicker="A PLACE FOR THE EXCEPTIONAL" title="ETCH YOUR" accent="NAME IN LEGACY." copy="A record of champions, defining milestones and the people who helped build BLACK DRAGONS." icon={Crown}/><section className="section-pad public-listing"><div className="public-listing-head"><div><div className="section-kicker">01 / THE IMMORTALS</div><h2>THE HALL<br/><em>OF FAME.</em></h2></div><span className="public-count">0 INDUCTEES</span></div><EmptyState icon={Medal} title="The hall is waiting for its first names." copy="Inductees will be selected from verified achievements and staff-recognised contributions. High kills alone do not automatically grant Hall of Fame status."/></section><section className="section-pad public-pillars"><ContentCard number="01" title="LEGENDARY RECORDS" copy="Milestones recognised through verified competitive records." icon={Trophy}/><ContentCard number="02" title="CHAMPIONS" copy="Players recognised for defining tournament and event performances." icon={Crown}/><ContentCard number="03" title="LEGACY CONTRIBUTORS" copy="Members recognised for meaningful contributions beyond the leaderboard." icon={Flame}/></section><section className="clan-bottom section-pad"><div className="section-kicker">YOUR STORY IS STILL BEING WRITTEN</div><h2>MAKE IT<br/><em>UNFORGETTABLE.</em></h2><Link className="button button-primary" to="/ranks">EXPLORE THE RANKS <ArrowRight size={16}/></Link></section></main>;
}
