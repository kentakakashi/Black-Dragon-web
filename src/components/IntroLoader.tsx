import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

const KEY = "bd-intro-seen-v1";

export function IntroLoader() {
  const [visible, setVisible] = useState(() => {
    try { return !sessionStorage.getItem(KEY); } catch { return false; }
  });
  const [ready, setReady] = useState(() => document.readyState === "complete");
  const [minimumElapsed, setMinimumElapsed] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const markReady = () => setReady(true);
    window.addEventListener("load", markReady);
    const minimumTimer = window.setTimeout(() => setMinimumElapsed(true), 1350);
    const safetyTimer = window.setTimeout(markReady, 5000);
    return () => {
      window.removeEventListener("load", markReady);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(safetyTimer);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !ready || !minimumElapsed || leaving) return;
    setLeaving(true);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* session storage may be unavailable */ }
    const timer = window.setTimeout(() => setVisible(false), 650);
    return () => window.clearTimeout(timer);
  }, [visible, ready, minimumElapsed, leaving]);

  const skip = () => {
    setLeaving(true);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* session storage may be unavailable */ }
    window.setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;
  return <div className={leaving ? "bd-intro is-leaving" : "bd-intro"} role="status" aria-label="Entering BLACK DRAGONS">
    <div className="intro-grain"/><div className="intro-vignette"/>
    <div className="intro-content">
      <div className="intro-emblem"><span>BD</span><i/><i/></div>
      <div className="intro-overline">THE LEGACY AWAKENS</div>
      <div className="intro-wordmark">BLACK <em>DRAGONS</em></div>
      <div className="intro-motto"><Shield size={12}/> STRENGTH · LOYALTY · LEGACY</div>
      <div className="intro-progress" aria-label={ready ? "Finishing introduction" : "Loading website"}><span/></div>
      <div className="intro-status">{ready ? "THE GATES ARE OPENING" : "PREPARING THE REALM"}</div>
    </div>
    <button className="intro-skip" onClick={skip}>SKIP INTRO <span aria-hidden="true">↗</span></button>
  </div>;
}
