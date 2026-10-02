import type { CSSProperties, PointerEvent, ReactNode } from "react";

type SpotlightStyle = CSSProperties & { "--spot-x"?: string; "--spot-y"?: string };
export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const move = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };
  return <article className={`spotlight-card ${className}`} onPointerMove={move} style={{ "--spot-x": "50%", "--spot-y": "50%" } as SpotlightStyle}>{children}</article>;
}
