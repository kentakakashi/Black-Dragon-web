import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

const KEY = "bd-intro-seen-v1";

export function IntroLoader() {
  const [visible, setVisible] = useState(() => {
    try { return !sessionStorage.getItem(KEY); } catch { return false; }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const finish = () => {
      setLeaving(true);
      try { sessionStorage.setItem(KEY, "1"); } catch { /* session storage may be unavailable */ }
      window.setTimeout(() => setVisible(false), 650);
    };
    const timer = window.setTimeout(finish, 1900);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  const skip = () => {
    setLeaving(true);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* session storage may be unavailable */ }
    window.setTimeout(() => setVisible(false), 350);
  };

  return <div className={leaving ? "bd-intro is-leaving" : "bd-intro"} role="status" aria-label="Entering BLACK DRAGONS">
    <div className="intro-grain"/><div className="intro-vignette"/>
    <div className="intro-content">
      <div className="intro-emblem"><span>BD</span><i/><i/></div>
      <div className="intro-overline">THE LEGACY AWAKENS</div>
      <div className="intro-wordmark">BLACK <em>DRAGONS</em></div>
      <div className="intro-motto"><Shield size={12}/> STRENGTH · LOYALTY · LEGACY</div>
      <div className="intro-progress"><span/></div>
      <div className="intro-status">PREPARING THE REALM</div>
    </div>
    <button className="intro-skip" onClick={skip}>SKIP INTRO <ChevronRightFallback/></button>
  </div>;
}

function ChevronRightFallback() { return <span aria-hidden="true">↗</span>; }
