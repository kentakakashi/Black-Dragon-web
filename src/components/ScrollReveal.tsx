import { useEffect, useRef, type ReactNode } from "react";

type ScrollRevealProps = { children: ReactNode; className?: string };

/** Lightweight Scroll Reveal treatment inspired by the React Bits motion collection.
 * Uses IntersectionObserver and transform/opacity rather than a continuously running animation.
 */
export function ScrollReveal({ children, className = "" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("rb-visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add("rb-visible");
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`rb-reveal ${className}`}>{children}</div>;
}
