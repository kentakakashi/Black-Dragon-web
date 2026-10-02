import { useState } from "react";
import { ArrowDown, ArrowRight, ChevronRight, Crown, Discord, ExternalLink, Flame, Menu, Shield, Swords, Trophy, X, Zap } from "lucide-react";

const ranks = [
  { name: "Z", kills: "50,000+", tone: "gold", note: "LEGENDARY" },
  { name: "SSS", kills: "20,000+", tone: "red", note: "ELITE" },
  { name: "SS", kills: "15,000+", tone: "red", note: "MASTER" },
  { name: "S", kills: "10,000+", tone: "red", note: "VETERAN" },
  { name: "A", kills: "7,500+", tone: "silver", note: "ADVANCED" },
  { name: "B", kills: "5,000+", tone: "silver", note: "SKILLED" },
  { name: "C", kills: "2,500+", tone: "silver", note: "RISING" },
  { name: "D", kills: "1,000+", tone: "silver", note: "ROOKIE" },
  { name: "E", kills: "0–999", tone: "silver", note: "INITIATE" },
];

const features = [
  { icon: Swords, title: "PROVE YOURSELF", body: "Step into the arena, take on challengers, and earn your place through skill." },
  { icon: Trophy, title: "CLIMB THE RANKS", body: "Your progress matters. Build your record and work your way toward the highest rank." },
  { icon: Shield, title: "STAND TOGETHER", body: "A community built around loyalty, respect, teamwork, and a shared identity." },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const discordInvite = import.meta.env.VITE_DISCORD_INVITE_URL || "";
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="site-shell">
      <div className="topline"><span className="pulse-dot" /> THE OFFICIAL HOME OF BLACK DRAGONS <span className="topline-right">EST. BD COMMUNITY</span></div>
      <header className="nav-wrap">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Black Dragons home">
          <span className="brand-mark"><span>BD</span></span>
          <span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span>
        </a>
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#about" onClick={closeMenu}>THE CLAN</a><a href="#ranks" onClick={closeMenu}>RANKS</a><a href="#leaderboard" onClick={closeMenu}>LEADERBOARD</a>
          <a className="nav-join" href={discordInvite || "#join"} target={discordInvite ? "_blank" : undefined} rel="noreferrer" onClick={closeMenu}>JOIN THE CLAN <ArrowRight size={15} /></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-grid" />
          <div className="hero-content">
            <div className="eyebrow"><span /> A LEGACY WRITTEN IN BATTLE</div>
            <h1>BUILT IN<br /><span>SHADOWS.</span><br />KNOWN BY <i>ALL.</i></h1>
            <p className="hero-copy">Not just a clan. A name earned through skill, loyalty, and the will to rise. This is <strong>BLACK DRAGONS.</strong></p>
            <div className="hero-actions">
              <a className="button button-primary" href={discordInvite || "#join"} target={discordInvite ? "_blank" : undefined} rel="noreferrer">ENTER THE COMMUNITY <ArrowRight size={17} /></a>
              <a className="button button-quiet" href="#about">DISCOVER BD <ChevronRight size={16} /></a>
            </div>
            <div className="hero-foot"><span><Flame size={15} /> NO SHORTCUTS. JUST PROOF.</span><a href="#about">SCROLL TO EXPLORE <ArrowDown size={14} /></a></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="dragon-emblem"><div className="emblem-inner"><span className="emblem-bd">BD</span><span className="emblem-line" /><span className="emblem-caption">BLACK DRAGONS</span></div></div>
            <div className="art-vertical">BLACK DRAGONS · ESTABLISHED IN UNITY</div>
            <div className="art-index">01 <span>/</span> 04</div>
          </div>
          <div className="hero-bottom-rule" />
        </section>

        <section className="ticker" aria-label="Clan motto"><div>HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b> HONOUR <b>✦</b> DISCIPLINE <b>✦</b> LOYALTY <b>✦</b> STRENGTH <b>✦</b> LEGACY <b>✦</b></div></section>

        <section className="intro section-pad" id="about">
          <div className="section-kicker">01 / WHO WE ARE</div>
          <div className="intro-main"><div><h2>A NAME THAT<br />CARRIES <em>WEIGHT.</em></h2></div><div className="intro-copy"><p>BLACK DRAGONS [BD] is a competitive community with one shared standard: earn your place. Every battle is an opportunity to improve, every rank a marker of progress, and every member part of something bigger.</p><p className="muted-copy">We value the people behind the player tag. Respect your allies. Respect your opponents. Represent the name.</p><a className="text-link" href="#ranks">EXPLORE THE RANK SYSTEM <ArrowRight size={16} /></a></div></div>
          <div className="feature-grid">{features.map(({icon: Icon,title,body},i)=><article className="feature-card" key={title}><div className="feature-top"><span>0{i+1}</span><Icon size={21}/></div><h3>{title}</h3><p>{body}</p></article>)}</div>
        </section>

        <section className="rank-section section-pad" id="ranks">
          <div className="section-kicker">02 / THE ROAD TO THE TOP</div><div className="section-heading"><div><h2>EARN YOUR<br /><em>INSIGNIA.</em></h2></div><p>Every tier represents progress. Put in the work, sharpen your game, and let your record speak.</p></div>
          <div className="rank-grid">{ranks.map((rank,i)=><article className={`rank-card ${rank.tone} ${i===0?"rank-legend":""}`} key={rank.name}><div className="rank-card-top"><span>{rank.note}</span>{i===0?<Crown size={17}/>:<span className="rank-number">0{i+1}</span>}</div><div className="rank-letter">{rank.name}</div><div className="rank-bottom"><span>REQUIRED KILLS</span><strong>{rank.kills}</strong></div></article>)}</div>
          <p className="rank-note"><Zap size={14}/> Rank thresholds shown as the current published progression guide. Official records will be displayed when the game data connection is configured.</p>
        </section>

        <section className="leader-section section-pad" id="leaderboard">
          <div className="leader-panel"><div className="leader-graphic"><div className="leader-ring"><Trophy size={54}/></div><span className="leader-stamp">BD / RANKINGS</span></div><div className="leader-copy"><div className="section-kicker">03 / THE HALL OF FAME</div><h2>LET THE<br /><em>NUMBERS TALK.</em></h2><p>The public leaderboard will showcase verified player records, kill counts, and current ranks. Live rankings are being connected to the clan's Firebase records.</p><div className="leader-status"><span className="status-dot" /> LIVE DATA CONNECTION — PENDING SETUP</div><button className="button button-outline" disabled>LEADERBOARD COMING SOON <ArrowRight size={16}/></button></div></div>
        </section>

        <section className="join-section section-pad" id="join"><div className="join-glow" /><div className="section-kicker">04 / YOUR STORY STARTS HERE</div><h2>WILL YOU<br /><em>RISE WITH US?</em></h2><p>The name is waiting. Make it mean something.</p>{discordInvite ? <a className="button button-primary" href={discordInvite} target="_blank" rel="noreferrer">JOIN BLACK DRAGONS <ArrowRight size={17}/></a> : <div className="setup-note">Discord invite link will appear here once configured.</div>}</section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#home"><span className="brand-mark"><span>BD</span></span><span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span></a><span className="footer-copy">© {new Date().getFullYear()} BLACK DRAGONS [BD]. ALL RIGHTS RESERVED.</span><a href="#home" className="back-top">BACK TO TOP ↑</a></footer>
    </div>
  );
}

export default App;