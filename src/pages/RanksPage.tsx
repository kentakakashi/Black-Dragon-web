import { Crown, Flame, Target, Zap } from "lucide-react";
import { ranks } from "../data/ranks";
import { ParticleField } from "../components/ParticleField";
import { ScrollReveal } from "../components/ScrollReveal";
import { SpotlightCard } from "../components/SpotlightCard";
import { TiltedCard } from "../components/TiltedCard";

export function RanksPage() {
  return <main className="inner-page"><section className="page-hero rank-page-hero"><ParticleField/><div className="section-kicker">THE ROAD TO THE TOP</div><h1>EARN YOUR<br/><em>INSIGNIA.</em></h1><p>Nine tiers. One climb. Every milestone is earned through your kill record.</p><div className="page-hero-mark"><Crown size={54}/><span>FROM INITIATE TO LEGEND</span></div></section>
    <section className="section-pad full-ranks"><div className="section-kicker">01 / THE RANK LADDER</div><div className="rank-intro"><h2>THE CLIMB<br/><em>STARTS HERE.</em></h2><p>Progress through the tiers by reaching the required kill milestones. Your record is your proof.</p></div><div className="rank-grid">{ranks.map((rank,i)=><ScrollReveal key={rank.name}><TiltedCard><SpotlightCard className={`rank-card full-rank-card ${rank.tone} ${i===0?"rank-legend":""}`}><div className="rank-card-top"><span>{rank.note}</span>{i===0?<Crown size={18}/>:<span className="rank-number">0{i+1}</span>}</div><div className="rank-letter">{rank.name}</div><div className="rank-bottom"><span>REQUIRED KILLS</span><strong>{rank.kills}</strong></div></SpotlightCard></TiltedCard></ScrollReveal>)}</div><p className="rank-note"><Zap size={14}/> Thresholds reflect the current published BD progression guide. Final rank assignment follows verified clan records.</p></section>
    <section className="rank-callout section-pad"><div className="callout-icon"><Target size={34}/></div><div><div className="section-kicker">02 / EVERY KILL COUNTS</div><h2>LET YOUR<br/><em>RECORD SPEAK.</em></h2><p>Keep improving, play with discipline, and let your progress do the talking.</p></div><Flame className="callout-flame" size={110}/></section>
  </main>;
}
