export function ParticleField() {
  return <div className="particle-field" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ "--i": i, "--delay": `${(i % 7) * -1.7}s`, "--duration": `${12 + (i % 8) * 2}s` } as React.CSSProperties} />)}</div>;
}
