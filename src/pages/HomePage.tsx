import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, ChevronRight, Crown, Flame, Shield, Swords, Trophy, Users, BookOpen } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { ShinyText } from "../components/ShinyText";
import { ParticleField } from "../components/ParticleField";
import { SpotlightCard } from "../components/SpotlightCard";
import { TiltedCard } from "../components/TiltedCard";
import { ranks } from "../data/ranks";

const features = [
  { icon: Swords, title: "PROVE YOURSELF", body: "Step into the arena, take on challengers, and earn your place through skill." },
  { icon: Trophy, title: "CLIMB THE RANKS", body: "Your progress matters. Build your record and work your way toward the highest rank." },
  { icon: Shield, title: "STAND TOGETHER", body: "A community built around loyalty, respect, teamwork, and a shared identity." },
];
type HomeStats = {members:number;verifiedProfiles:number;totalVerifiedKills:number;averageKills:number};
type HomeEvent = {id:string;title:string;category:string;description:string;startsAt:number;endsAt:number;location:string;status:string;registrationOpen:boolean};
type HomeStory = {id:string;title:string;excerpt:string;category:string;authorName:string;publishedAt:number};
type HomeHall = {id:string;displayName:string;category:string;reason:string;inductedAt:number};

function dateLabel(value:number){return value?new Date(value).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"}):"DATE TO BE ANNOUNCED";}
function formatNumber(value:number){return Math.max(0,Number(value)||0).toLocaleString("en-US");}

export function HomePage() {
  const [stats,setStats]=useState<HomeStats|null>(null);
  const [events,setEvents]=useState<HomeEvent[]>([]);
  const [stories,setStories]=useState<HomeStory[]>([]);
  const [hall,setHall]=useState<HomeHall[]>([]);
  const [liveState,setLiveState]=useState<"loading"|"ready"|"partial">("loading");
  useEffect(()=>{
    let active=true;
    const load=async()=>{
      const results=await Promise.allSettled([
        fetch("/.netlify/functions/public-stats",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}),
        fetch("/.netlify/functions/events",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}),
        fetch("/.netlify/functions/content?type=news",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();}),
        fetch("/.netlify/functions/content?type=hall",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json();})
      ]);
      if(!active)return;
      let successes=0;
      if(results[0].status==="fulfilled"){setStats(results[0].value);successes++;}
      if(results[1].status==="fulfilled"){setEvents((results[1].value.events||[]).filter((e:HomeEvent)=>e.status==="published"&&e.startsAt>Date.now()).sort((a:HomeEvent,b:HomeEvent)=>a.startsAt-b.startsAt).slice(0,2));successes++;}
      if(results[2].status==="fulfilled"){setStories((results[2].value.entries||[]).slice(0,2));successes++;}
      if(results[3].status==="fulfilled"){setHall((results[3].value.entries||[]).slice(0,1));successes++;}
      setLiveState(successes===4?"ready":successes>0?"partial":"partial");
    };
    load().catch(()=>{if(active)setLiveState("partial");});
    return()=>{active=false;};
  },[]);
  return <main>
    <section className="hero" id="home"><div className="hero-grid" /><ParticleField />
      <div className="hero-content"><div className="eyebrow"><span /> A LEGACY WRITTEN IN BATTLE</div>
        <ScrollReveal className="hero-title"><h1>BUILT IN<br /><span className="hero-shine"><ShinyText text="SHADOWS." /></span><br />KNOWN BY <i>ALL.</i></h1></ScrollReveal>
        <p className="hero-copy">Not just a clan. A name earned through skill, loyalty, and the will to rise. This is <strong>BLACK DRAGONS.</strong></p>
        <div className="hero-actions"><Link className="button button-primary" to="/join">ENTER THE COMMUNITY <ArrowRight size={17} /></Link><Link className="button button-quiet" to="/clan">DISCOVER BD <ChevronRight size={16} /></Link></div>
        <div className="hero-foot"><span><Flame size={15} /> NO SHORTCUTS. JUST PROOF.</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={14} /></a></div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><img className="hero-dragon" src="https://cdn.pixabay.com/photo/2023/11/13/03/58/dragon-8384505_1280.jpg" alt="" fetchPriority="high" /><div className="dragon-emblem"><div className="emblem-inner"><span className="emblem-bd">BD</span><span className="emblem-line" /><span className="emblem-caption">BLACK DRAGONS</span></div></div><div className="art-vertical">BLACK DRAGONS · ESTABLISHED IN UNITY</div><div className="art-index">01 <span>/</span> 04</div></div>
      <div className="hero-bottom-rule" />
    </section>
    <section className="ticker" aria-label="Clan motto"><div>HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b> HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b></div></section>
    <section className="intro section-pad" id="about"><div className="section-kicker">01 / WHO WE ARE</div><div className="intro-main"><div><h2>A NAME THAT<br />CARRIES <em>WEIGHT.</em></h2></div><div className="intro-copy"><p>BLACK DRAGONS [BD] is a competitive community with one shared standard: earn your place. Every battle is an opportunity to improve, every rank a marker of progress, and every member part of something bigger.</p><p className="muted-copy">We value the people behind the player tag. Respect your allies. Respect your opponents. Represent the name.</p><Link className="text-link" to="/clan">MEET THE CLAN <ArrowRight size={16} /></Link></div></div>
      <div className="feature-grid">{features.map(({icon: Icon,title,body},i)=><ScrollReveal key={title}><SpotlightCard className="feature-card"><div className="feature-top"><span>0{i+1}</span><Icon size={21}/></div><h3>{title}</h3><p>{body}</p></SpotlightCard></ScrollReveal>)}</div>
    </section>
    <section className="home-live section-pad">
      <div className="section-kicker">LIVE FROM THE BD DATABASE</div>
      <div className="home-live-heading"><div><h2>THE CLAN.<br/><em>IN REAL TIME.</em></h2></div><span className={"home-live-status "+(liveState==="ready"?"is-live":"")}>{liveState==="loading"?"CONNECTING TO THE ARCHIVE":liveState==="ready"?"LIVE DATA CONNECTED":"LIVE DATA PARTIALLY AVAILABLE"}</span></div>
      <div className="home-stats-grid">
        <ScrollReveal><article className="home-stat-card"><Users/><span>PLAYER RECORDS</span><strong>{stats?formatNumber(stats.members):"—"}</strong><small>Canonical bot player records</small></article></ScrollReveal>
        <ScrollReveal><article className="home-stat-card"><Shield/><span>PUBLIC PROFILES</span><strong>{stats?formatNumber(stats.verifiedProfiles):"—"}</strong><small>Discord identities connected</small></article></ScrollReveal>
        <ScrollReveal><article className="home-stat-card"><Flame/><span>VERIFIED KILLS</span><strong>{stats?formatNumber(stats.totalVerifiedKills):"—"}</strong><small>Across canonical player records</small></article></ScrollReveal>
      </div>
      <div className="home-live-links"><Link className="text-link" to="/statistics">EXPLORE PUBLIC STATISTICS <ArrowRight size={15}/></Link><Link className="text-link" to="/leaderboard">VIEW THE LEADERBOARD <ArrowRight size={15}/></Link></div>
    </section>
    <section className="rank-section section-pad"><div className="section-kicker">02 / THE ROAD TO THE TOP</div><div className="section-heading"><div><h2>EARN YOUR<br /><em>INSIGNIA.</em></h2></div><p>Every tier represents progress. Put in the work, sharpen your game, and let your record speak.</p></div>
      <div className="rank-grid">{ranks.slice(0,3).map((rank,i)=><ScrollReveal key={rank.name}><TiltedCard><SpotlightCard className={`rank-card ${rank.tone} ${i===0?"rank-legend":""}`}><div className="rank-card-top"><span>{rank.note}</span>{i===0?<Crown size={17}/>:<span className="rank-number">0{i+1}</span>}</div><div className="rank-letter">{rank.name}</div><div className="rank-bottom"><span>REQUIRED KILLS</span><strong>{rank.kills}</strong></div></SpotlightCard></TiltedCard></ScrollReveal>)}</div>
      <Link className="text-link rank-more" to="/ranks">VIEW ALL NINE RANKS <ArrowRight size={16}/></Link>
    </section>
    <section className="home-feed section-pad">
      <div className="section-kicker">03 / WHAT'S HAPPENING</div>
      <div className="home-feed-heading"><div><h2>THE LATEST<br/><em>FROM BD.</em></h2></div><Link className="text-link" to="/news">OPEN THE JOURNAL <ArrowUpRight size={15}/></Link></div>
      {stories.length?<div className="home-feed-grid">{stories.map((story,i)=><ScrollReveal key={story.id}><Link to={"/news/"+story.id} className="home-feed-card"><span className="section-kicker">CHRONICLE / 0{i+1} · {String(story.category||"COMMUNITY").toUpperCase()}</span><h3>{story.title}</h3><p>{story.excerpt}</p><small>{dateLabel(story.publishedAt)} · {story.authorName||"BD STAFF"}</small><span className="text-link">READ STORY <ArrowRight size={14}/></span></Link></ScrollReveal>)}</div>:<p className="home-feed-empty">The next chapter will appear here when a story is published.</p>}
      <div className="home-events-heading"><div><div className="section-kicker">UPCOMING OPERATIONS</div><h3>THE NEXT<br/><em>GATHERING.</em></h3></div><Link className="text-link" to="/events">ALL EVENTS <ArrowUpRight size={15}/></Link></div>
      {events.length?<div className="home-events-grid">{events.map(event=><article className="home-event-card" key={event.id}><div className="home-event-date"><CalendarDays size={19}/><strong>{dateLabel(event.startsAt)}</strong></div><span className="section-kicker">{String(event.category||"COMMUNITY").toUpperCase()} / BLACK DRAGONS</span><h4>{event.title}</h4><p>{event.description}</p><span className="home-event-state">{event.registrationOpen?"REGISTRATION OPEN":"REGISTRATION CLOSED"}</span></article>)}</div>:<p className="home-feed-empty">No upcoming events are published right now. Check the events page for updates.</p>}
    </section>
    <section className="home-cta section-pad"><div className="leader-ring"><Trophy size={42}/></div><div><div className="section-kicker">04 / THE HALL OF FAME</div><h2>YOUR NAME<br/><em>COULD BE HERE.</em></h2><p>Verified records. Earned recognition. See who's climbing the ranks.</p>{hall.length>0&&<div className="home-hall-spotlight"><Crown size={16}/><span>RECENT INDUCTEE</span><strong>{hall[0].displayName}</strong><small>{hall[0].category}</small></div>}<Link className="button button-primary" to="/hall-of-fame">OPEN HALL OF FAME <ArrowRight size={16}/></Link></div></section>
    <section className="join-section section-pad"><div className="section-kicker">05 / YOUR STORY STARTS HERE</div><h2>WILL YOU<br /><em>RISE WITH US?</em></h2><p>The name is waiting. Make it mean something.</p><Link className="button button-primary" to="/join">JOIN BLACK DRAGONS <ArrowRight size={17} /></Link></section>
  </main>;
}
