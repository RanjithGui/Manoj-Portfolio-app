import { useRef } from "react";

import { content } from "./content";
import { lerp, sectionProgress, smooth, useFrame, useInViewOnce, usePointer, useVisible } from "./hooks";

/** Captions type themselves in, one character at a time. */
function Typed({ lines, delay, className }: { lines: string[]; delay: number; className?: string }) {
  let n = 0;
  return (
    <p className={className}>
      {lines.map((l) => (
        <span key={l} className="typed__line">
          {[...l].map((ch, i) => (
            <span key={i} style={{ "--k": delay + n++ * 0.028 } as React.CSSProperties}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}

export function Finale() {
  const section = useRef<HTMLElement>(null);
  const frame1 = useRef<HTMLDivElement>(null);
  const frame2 = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const fig = useRef<HTMLDivElement>(null);
  const visible = useVisible(section);
  const seen = useInViewOnce(section, 0.2);
  const pointer = usePointer();
  const p = useRef({ x: 0, y: 0, k: 0 });
  const { finale } = content;

  useFrame(() => {
    const s = p.current;
    s.x = lerp(s.x, pointer.nx, 0.05);
    s.y = lerp(s.y, pointer.ny, 0.05);
    // damped scroll progress drives frame 2 sliding in from the left
    s.k = lerp(s.k, smooth((sectionProgress(section.current) - 0.42) / 0.42), 0.12);
    const k = s.k;
    if (word.current) word.current.style.transform = `translate3d(${s.x * -8}px, ${s.y * -5}px, 0)`;
    if (fig.current) fig.current.style.transform = `translate3d(${s.x * 16}px, ${s.y * 6}px, 0)`;
    if (frame1.current) {
      frame1.current.style.transform = `translate3d(${k * 14}vw, 0, 0) scale(${1 - k * 0.05})`;
      frame1.current.style.filter = `brightness(${1 - k * 0.6})`;
    }
    if (frame2.current) {
      frame2.current.style.transform = `translate3d(${(k - 1) * 102}%, 0, 0)`;
      frame2.current.style.filter = `blur(${(1 - k) * 14}px) brightness(${0.4 + k * 0.6})`;
      frame2.current.style.visibility = k < 0.002 ? "hidden" : "visible";
    }
  }, visible);

  return (
    <section id="contact" ref={section} className={`finale ${seen ? "is-live" : ""}`} aria-label="Contact">
      <div className="finale__pin">
        <div ref={frame1} className="finale__frame">
          <div className="finale__fog" aria-hidden>
            <i />
            <i />
            <i />
            <i />
          </div>
          <div ref={word} className="finale__word" aria-hidden>
            <svg viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="fw-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fbe9df" />
                  <stop offset="0.45" stopColor="#f0b9a6" />
                  <stop offset="0.8" stopColor="#d4372a" />
                  <stop offset="1" stopColor="#6d0c08" />
                </linearGradient>
                <filter id="fw-tex" colorInterpolationFilters="sRGB">
                  <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="4" seed="6" result="n" />
                  <feColorMatrix in="n" type="matrix" values="0.32 0 0 0 0.76  0.32 0 0 0 0.72  0.32 0 0 0 0.72  0 0 0 0 1" result="m" />
                  <feBlend in="SourceGraphic" in2="m" mode="multiply" result="b" />
                  <feComposite in="b" in2="SourceGraphic" operator="in" />
                </filter>
              </defs>
              <text
                x="500"
                y="730"
                textAnchor="middle"
                textLength="960"
                lengthAdjust="spacingAndGlyphs"
                fontFamily="Anton, Impact, sans-serif"
                fontSize="780"
                fill="url(#fw-fill)"
                filter="url(#fw-tex)"
              >
                {content.name}
              </text>
            </svg>
          </div>
          <div className="finale__veil" aria-hidden />
          {finale.figure && (
            <div ref={fig} className="finale__figure">
              <img src={finale.figure} alt="" />
            </div>
          )}

          <div className="finale__cap finale__cap--tl">
            <Typed lines={finale.topLeft} delay={2.0} />
          </div>
          <div className="finale__cap finale__cap--tr">
            <Typed lines={finale.topRight} delay={2.3} />
          </div>
          <div className="finale__quote">
            <Typed lines={finale.quote.map((l, i) => (i === 0 ? `“${l}` : i === finale.quote.length - 1 ? `${l}”` : l))} delay={2.6} />
          </div>
          <div className="finale__cap finale__cap--bl">
            <Typed lines={finale.bottomLeft} delay={2.9} />
          </div>
          <div className="finale__cap finale__cap--br">
            <Typed lines={finale.bottomRight} delay={3.1} />
          </div>
        </div>

        <div ref={frame2} className="finale__frame2">
          <p className="kicker">What's next</p>
          <h2>{finale.cta}</h2>
          <a className="finale__mail" href={`mailto:${content.email}`}>
            {content.email}
            <span aria-hidden>↗</span>
          </a>
        </div>

        <footer className="finale__row">
          <a href={`mailto:${content.email}`}>{content.email}</a>
          <ul>
            {finale.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href}>{s.label}</a>
              </li>
            ))}
          </ul>
          <span>
            © {new Date().getFullYear()} {content.name}
          </span>
        </footer>
      </div>
    </section>
  );
}
