import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowUpRight, ChevronRight, LockKeyhole, Menu, X } from "lucide-react";
import { IntroLoader } from "./IntroLoader";

const invite = import.meta.env.VITE_DISCORD_INVITE_URL || "https://discord.gg/7C2uT3YX6E";
type MenuItem = { label: string; live: boolean; to?: string; external?: boolean };
type MenuGroup = { number: string; title: string; subtitle: string; items: MenuItem[] };
const groups: MenuGroup[] = [
  { number: "01", title: "DISCOVER", subtitle: "ENTER THE WORLD OF BD", items: [
    { label: "Home", to: "/", live: true }, { label: "The Clan", to: "/clan", live: true },
    { label: "Announcements", to: "/announcements", live: true }, { label: "News & Stories", to: "/news", live: true }, { label: "Rules", to: "/rules", live: true },
  ]},
  { number: "02", title: "MY ACCOUNT", subtitle: "YOUR PERSONAL RECORD", items: [
    { label: "My Profile", live: false }, { label: "Roblox Link", live: false },
    { label: "My Statistics", live: false }, { label: "My Applications", live: false }, { label: "Account Settings", live: false },
  ]},
  { number: "03", title: "COMPETITION", subtitle: "EARN YOUR INSIGNIA", items: [
    { label: "Ranks", to: "/ranks", live: true }, { label: "Leaderboard", to: "/leaderboard", live: true },
    { label: "Tryouts", live: false }, { label: "Events", live: false }, { label: "Hall of Fame", to: "/hall-of-fame", live: true },
  ]},
  { number: "04", title: "COMMUNITY", subtitle: "THE PEOPLE BEHIND BD", items: [
    { label: "Members", to: "/members", live: true }, { label: "Staff Team", to: "/staff", live: true },
    { label: "Applications", live: false }, { label: "Discord Server", external: true, live: true },
  ]},
];

function ScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [pathname]);
  return null;
}

export function SiteLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  return <div className="site-shell"><ScrollReset /><IntroLoader />
    <div className="topline"><span className="pulse-dot" /> THE OFFICIAL HOME OF BLACK DRAGONS <span className="topline-right">EST. BD COMMUNITY</span></div>
    <header className="nav-wrap">
      <Link className="brand" to="/" aria-label="Black Dragons home"><span className="brand-mark"><span>BD</span></span><span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span></Link>
      <button className={open ? "menu-toggle is-open" : "menu-toggle"} onClick={() => setOpen(value => !value)} aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="bd-navigation">
        <span className="menu-toggle-label">{open ? "CLOSE" : "EXPLORE"}</span><span className="menu-toggle-icon">{open ? <X size={23}/> : <Menu size={24}/>}</span>
      </button>
    </header>

    <div className={open ? "menu-backdrop is-visible" : "menu-backdrop"} onMouseDown={() => setOpen(false)} aria-hidden={!open}>
      <nav id="bd-navigation" className="mega-menu" aria-label="BLACK DRAGONS navigation" aria-modal="true" role="dialog" onMouseDown={event => event.stopPropagation()}>
        <div className="mega-menu-aside">
          <div className="menu-aside-top"><span className="section-kicker">THE OFFICIAL HEADQUARTERS</span><span className="menu-index">BD / 001</span></div>
          <div className="menu-dragon-art"><div className="menu-dragon-ring"/><span className="menu-dragon-mark">BD</span><span className="menu-dragon-caption">STRENGTH · LOYALTY · LEGACY</span></div>
          <div className="menu-aside-bottom"><span>BUILT IN SHADOWS.<br/><b>KNOWN BY ALL.</b></span><a href={invite} target="_blank" rel="noreferrer">ENTER THE DISCORD <ArrowUpRight size={15}/></a></div>
        </div>
        <div className="mega-menu-content">
          <div className="mega-menu-heading"><div><span className="section-kicker">CHOOSE YOUR PATH</span><h2>THE <em>GATEWAY.</em></h2></div><span className="menu-scroll-note">NAVIGATE THE LEGACY <ChevronRight size={13}/></span></div>
          <div className="menu-groups">{groups.map(group=><section className="menu-group" key={group.number}>
            <div className="menu-group-heading"><span>{group.number}</span><div><h3>{group.title}</h3><small>{group.subtitle}</small></div></div>
            <div className="menu-group-links">{group.items.map(item=>item.external
              ? <a className="menu-link" key={item.label} href={invite} target="_blank" rel="noreferrer"><span>{item.label}</span><ArrowUpRight size={14}/></a>
              : item.live && item.to
                ? <NavLink className="menu-link" key={item.label} to={item.to}><span>{item.label}</span><ChevronRight size={14}/></NavLink>
                : <span className="menu-link is-coming" key={item.label}><span>{item.label}</span><small>COMING SOON</small></span>
            )}</div>
          </section>)}</div>
          <div className="menu-admin-lock"><div className="admin-lock-icon"><LockKeyhole size={18}/></div><div><strong>ADMINISTRATION</strong><span>STAFF CONTROL CENTRE · ROLE RESTRICTED</span></div><span className="admin-lock-status">STAFF ACCESS</span></div>
          <div className="mega-menu-footer"><span>© {new Date().getFullYear()} BLACK DRAGONS [BD]</span><span>ONE NAME. ONE LEGACY.</span></div>
        </div>
      </nav>
    </div>

    <div className="route-stage" key={location.pathname}><Outlet /></div>
    <footer className="footer"><Link className="brand footer-brand" to="/"><span className="brand-mark"><span>BD</span></span><span className="brand-name">BLACK <b>DRAGONS</b><small>STRENGTH · LOYALTY · LEGACY</small></span></Link><span className="footer-copy">© {new Date().getFullYear()} BLACK DRAGONS [BD]. ALL RIGHTS RESERVED.</span><a href={invite} target="_blank" rel="noreferrer" className="back-top">JOIN THE LEGACY ↗</a></footer>
  </div>;
}
