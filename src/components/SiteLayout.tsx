import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect } from "react";

const invite = import.meta.env.VITE_DISCORD_INVITE_URL || "";
const links = [{ to: "/", label: "HOME", end: true }, { to: "/clan", label: "THE CLAN" }, { to: "/ranks", label: "RANKS" }, { to: "/leaderboard", label: "LEADERBOARD" }];

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

export function SiteLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  return <div className="site-shell"><ScrollReset />
    <div className="topline"><span className="pulse-dot" /> THE OFFICIAL HOME OF BLACK DRAGONS <span className="topline-right">EST. BD COMMUNITY</span></div>
    <header className="nav-wrap">
      <Link className="brand" to="/" aria-label="Black Dragons home"><span className="brand-mark"><span>BD</span></span><span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span></Link>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>{link.label}</NavLink>)}
        <a className="nav-join" href={invite || "/join"} target={invite ? "_blank" : undefined} rel="noreferrer" onClick={() => setOpen(false)}>JOIN THE CLAN <ArrowRight size={15} /></a>
      </nav>
    </header>
    <div className="route-stage"><Outlet /></div>
    <footer className="footer"><Link className="brand footer-brand" to="/"><span className="brand-mark"><span>BD</span></span><span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span></Link><span className="footer-copy">© {new Date().getFullYear()} BLACK DRAGONS [BD]. ALL RIGHTS RESERVED.</span><Link to="/join" className="back-top">JOIN THE LEGACY ↗</Link></footer>
  </div>;
}
