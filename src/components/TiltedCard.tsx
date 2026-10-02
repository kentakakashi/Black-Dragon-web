import type { CSSProperties, PointerEvent, ReactNode } from "react";

type TiltStyle = CSSProperties & { "--tilt-x"?: string; "--tilt-y"?: string };

export function TiltedCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${-y * 5}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 5}deg`);
  };
  const reset = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };
  return <div className={`tilted-card ${className}`} onPointerMove={move} onPointerLeave={reset} style={{ "--tilt-x": "0deg", "--tilt-y": "0deg" } as TiltStyle}>{children}</div>;
}
