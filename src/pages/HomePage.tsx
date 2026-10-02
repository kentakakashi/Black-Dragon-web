import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ChevronRight, Crown, Flame, Shield, Swords, Trophy } from "lucide-react";
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

export function HomePage() {
  return <main>
    <section className="hero" id="home"><div className="hero-grid" /><ParticleField />
      <div className="hero-content"><div className="eyebrow"><span /> A LEGACY WRITTEN IN BATTLE</div>
        <ScrollReveal className="hero-title"><h1>BUILT IN<br /><span className="hero-shine"><ShinyText text="SHADOWS." /></span><br />KNOWN BY <i>ALL.</i></h1></ScrollReveal>
        <p className="hero-copy">Not just a clan. A name earned through skill, loyalty, and the will to rise. This is <strong>BLACK DRAGONS.</strong></p>
        <div className="hero-actions"><Link className="button button-primary" to="/join">ENTER THE COMMUNITY <ArrowRight size={17} /></Link><Link className="button button-quiet" to="/clan">DISCOVER BD <ChevronRight size={16} /></Link></div>
        <div className="hero-foot"><span><Flame size={15} /> NO SHORTCUTS. JUST PROOF.</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={14} /></a></div>
      </div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><img className="hero-dragon" src="https://images.unsplash.com/photo-1719046828615-8d93256b9eaf?auto=format&amp;fit=crop&amp;w=1800&amp;q=85" alt="" fetchPriority="high" /><div className="dragon-emblem"><div className="emblem-inner"><span className="emblem-bd">BD</span><span className="emblem-line" /><span className="emblem-caption">BLACK DRAGONS</span></div></div><div className="art-vertical">BLACK DRAGONS · ESTABLISHED IN UNITY</div><div className="art-index">01 <span>/</span> 04</div></div>
      <div className="hero-bottom-rule" />
    </section>
    <section className="ticker" aria-label="Clan motto"><div>HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b> HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b></div></section>
    <section className="intro section-pad" id="about"><div className="section-kicker">01 / WHO WE ARE</div><div className="intro-main"><div><h2>A NAME THAT<br />CARRIES <em>WEIGHT.</em></h2></div><div className="intro-copy"><p>BLACK DRAGONS [BD] is a competitive community with one shared standard: earn your place. Every battle is an opportunity to improve, every rank a marker of progress, and every member part of something bigger.</p><p className="muted-copy">We value the people behind the player tag. Respect your allies. Respect your opponents. Represent the name.</p><Link className="text-link" to="/clan">MEET THE CLAN <ArrowRight size={16} /></Link></div></div>
      <div className="feature-grid">{features.map(({icon: Icon,title,body},i)=><ScrollReveal key={title}><SpotlightCard className="feature-card"><div className="feature-top"><span>0{i+1}</span><Icon size={21}/></div><h3>{title}</h3><p>{body}</p></SpotlightCard></ScrollReveal>)}</div>
    </section>
    <section className="rank-section section-pad"><div className="section-kicker">02 / THE ROAD TO THE TOP</div><div className="section-heading"><div><h2>EARN YOUR<br /><em>INSIGNIA.</em></h2></div><p>Every tier represents progress. Put in the work, sharpen your game, and let your record speak.</p></div>
      <div className="rank-grid">{ranks.slice(0,3).map((rank,i)=><ScrollReveal key={rank.name}><TiltedCard><SpotlightCard className={`rank-card ${rank.tone} ${i===0?"rank-legend":""}`}><div className="rank-card-top"><span>{rank.note}</span>{i===0?<Crown size={17}/>:<span className="rank-number">0{i+1}</span>}</div><div className="rank-letter">{rank.name}</div><div className="rank-bottom"><span>REQUIRED KILLS</span><strong>{rank.kills}</strong></div></SpotlightCard></TiltedCard></ScrollReveal>)}</div>
      <Link className="text-link rank-more" to="/ranks">VIEW ALL NINE RANKS <ArrowRight size={16}/></Link>
    </section>
    <section className="home-cta section-pad"><div className="leader-ring"><Trophy size={42}/></div><div><div className="section-kicker">03 / THE HALL OF FAME</div><h2>YOUR NAME<br/><em>COULD BE HERE.</em></h2><p>Verified records. Earned recognition. See who's climbing the ranks.</p><Link className="button button-primary" to="/leaderboard">OPEN LEADERBOARD <ArrowRight size={16}/></Link></div></section>
    <section className="join-section section-pad"><div className="section-kicker">04 / YOUR STORY STARTS HERE</div><h2>WILL YOU<br /><em>RISE WITH US?</em></h2><p>The name is waiting. Make it mean something.</p><Link className="button button-primary" to="/join">JOIN BLACK DRAGONS <ArrowRight size={17}/></Link></section>
  </main>;
}
