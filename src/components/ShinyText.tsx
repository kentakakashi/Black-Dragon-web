import type { CSSProperties } from "react";

type ShinyTextProps = {
  text: string;
  className?: string;
  speed?: number;
};

/** Lightweight CSS-only Shiny Text treatment adapted from the React Bits Shiny Text idea.
 * No animation library or per-frame JavaScript is required.
 */
export function ShinyText({ text, className = "", speed = 5 }: ShinyTextProps) {
  const style = { "--shine-speed": `${speed}s` } as CSSProperties;
  return <span className={`rb-shiny-text ${className}`} style={style}>{text}</span>;
}
