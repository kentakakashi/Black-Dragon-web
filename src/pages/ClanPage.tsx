import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Shield, Swords, Users } from "lucide-react";
import { ParticleField } from "../components/ParticleField";
import { ScrollReveal } from "../components/ScrollReveal";
import { SpotlightCard } from "../components/SpotlightCard";

const pillars = [
  { icon: Swords, number: "01", title: "SKILL WITH PURPOSE", copy: "We compete to improve. Every match is a chance to sharpen your timing, learn, and earn respect." },
  { icon: HeartHandshake, number: "02", title: "LOYALTY ABOVE EGO", copy: "A clan is built by its people. Respect teammates, opponents, and the community you represent." },
  { icon: Shield, number: "03", title: "DISCIPLINE & RESPECT", copy: "Carry the name with pride. Keep competition fair, communication clear, and conduct respectful." },
];
export function ClanPage() {
  return <main className="inner-page"><section className="page-hero"><ParticleField/><div className="section-kicker">THE PEOPLE BEHIND THE EMBLEM</div><h1>MORE THAN<br/><em>A CLAN.</em></h1><p>One name. One community. A legacy built by every member who chooses to represent it.</p><div className="page-hero-mark"><Users size={58}/><span>BLACK DRAGONS [BD]</span></div></section>
    <section className="section-pad clan-story"><div className="section-kicker">01 / OUR IDENTITY</div><div className="intro-main"><h2>STRENGTH IN<br/><em>UNITY.</em></h2><div className="intro-copy"><p>BLACK DRAGONS [BD] is a competitive community centered around skill, progression, and loyalty. Your record matters, but so does the way you earn it and the way you treat the people around you.</p><p className="muted-copy">The emblem is shared. The responsibility that comes with it belongs to every member.</p></div></div></section>
    <section className="section-pad pillars-section"><div className="section-kicker">02 / WHAT WE STAND FOR</div><h2 className="display-heading">THE CODE<br/><em>OF THE DRAGON.</em></h2><div className="feature-grid">{pillars.map(({icon:Icon,number,title,copy})=><ScrollReveal key={number}><SpotlightCard className="feature-card pillar-card"><div className="feature-top"><span>{number}</span><Icon size={22}/></div><h3>{title}</h3><p>{copy}</p></SpotlightCard></ScrollReveal>)}</div></section>
    <section className="clan-bottom section-pad"><div className="section-kicker">03 / FIND YOUR PLACE</div><h2>READY TO<br/><em>REPRESENT?</em></h2><p>Meet the community, learn the standards, and begin your journey.</p><Link to="/join" className="button button-primary">HOW TO JOIN <ArrowRight size={16}/></Link></section>
  </main>;
}
