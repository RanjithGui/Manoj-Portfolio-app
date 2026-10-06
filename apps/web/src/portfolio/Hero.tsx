import { useRef } from "react";

import { content } from "./content";
import { lerp, useFrame, usePointer, useVisible } from "./hooks";

/** Red distressed wordmark. The wear is procedural (SVG turbulence), not a bitmap. */
export function Wordmark({ id, text, className }: { id: string; text: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1600 560" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#ff2a22" />
          <stop offset="0.55" stopColor="#e3140f" />
          <stop offset="1" stopColor="#a50b09" />
        </linearGradient>
        <filter id={`${id}-wear`} x="-2%" y="-2%" width="104%" height="104%" colorInterpolationFilters="sRGB">
          {/* fine speckle holes */}
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n1" />
          <feColorMatrix in="n1" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3.2 0 0 0 2.75" result="speck" />
          {/* long thin scratches: stretched noise, thresholded hard */}
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.07" numOctaves="2" seed="11" result="n2" />
          <feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -18 0 0 0 14.6" result="scratch" />
          <feComposite in="speck" in2="scratch" operator="arithmetic" k1="1" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" result="cut" />
          {/* low-frequency mottling so the red is never flat */}
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="2" result="n3" />
          <feColorMatrix in="n3" type="matrix" values="0.55 0 0 0 0.58  0.55 0 0 0 0.58  0.55 0 0 0 0.58  0 0 0 0 1" result="mottle" />
          <feBlend in="cut" in2="mottle" mode="multiply" result="shaded" />
          <feComposite in="shaded" in2="cut" operator="in" />
        </filter>
      </defs>
      <text
        x="800"
        y="520"
        textAnchor="middle"
        textLength="1500"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="610"
        fill={`url(#${id}-fill)`}
        filter={`url(#${id}-wear)`}
      >
        {text}
      </text>
    </svg>
  );
}

export function Header({ ready }: { ready: boolean }) {
  return (
    <header className={`site-header ${ready ? "is-in" : ""}`}>
      <a href="#top" className="site-header__logo">
        {content.name}
        <span>.</span>
      </a>
      <nav className="site-header__nav" aria-label="Sections">
        {content.nav.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>
      <a href="#contact" className="site-header__cta">
        Let's talk
      </a>
      <span className="site-header__rule" aria-hidden />
    </header>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLDivElement>(null);
  const furn = useRef<HTMLDivElement>(null);
  const ember = useRef<HTMLDivElement>(null);
  const visible = useVisible(ref);
  const pointer = usePointer();
  const p = useRef({ x: 0, y: 0 });

  useFrame((t) => {
    p.current.x = lerp(p.current.x, pointer.nx, 0.06);
    p.current.y = lerp(p.current.y, pointer.ny, 0.06);
    const { x, y } = p.current;
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    // depth order: wordmark (far) < furniture < figure (near)
    if (word.current)
      word.current.style.transform = `translate3d(${x * -10}px, ${y * -6 + scroll * 60}px, 0) scale(${1 + scroll * 0.06})`;
    if (furn.current) furn.current.style.transform = `translate3d(${x * -18}px, ${y * -10 + scroll * 30}px, 0)`;
    if (fig.current) fig.current.style.transform = `translate3d(${x * 22}px, ${y * 8 + scroll * -20}px, 0)`;
    if (ember.current) ember.current.style.opacity = String(0.75 + Math.sin(t * 0.9) * 0.18);
  }, visible);

  const { hero } = content;
  return (
    <section id="top" ref={ref} className={`hero ${ready ? "is-live" : ""}`} aria-label="Introduction">
      <div className="hero__ember" ref={ember} aria-hidden />
      <div className="hero__word" ref={word}>
        <Wordmark id="hero" text={content.name} className="hero__svg" />
      </div>
      <h1 className="sr-only">
        {content.name} — {content.role}
      </h1>

      {hero.figure && (
        <div className="hero__figure" ref={fig}>
          <img src={hero.figure} alt="" />
        </div>
      )}

      <div className="hero__furniture" ref={furn} aria-hidden>
        <p className="hero__eyebrow">
          <Dots n={3} />
          <span>{hero.eyebrow}</span>
          <Dots n={3} />
        </p>
        <span className="chip chip--left">
          <i>•</i>
          {hero.chipLeft}
          <i>•</i>
        </span>
        <span className="chip chip--right">
          <i>•</i>
          {hero.chipRight}
          <i>•</i>
        </span>
        <div className="arrows arrows--left">
          {Array.from({ length: 6 }, (_, i) => (
            <b key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <div className="arrows arrows--right">
          {Array.from({ length: 6 }, (_, i) => (
            <b key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        <div className="dotgrid">
          {Array.from({ length: 18 }, (_, i) => (
            <b key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <a href="#universe" className="hero__scroll">
        <span>Scroll</span>
        <i />
      </a>
    </section>
  );
}

function Dots({ n }: { n: number }) {
  return (
    <span className="dots" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} />
      ))}
    </span>
  );
}
