import { useRef } from "react";

import { content } from "./content";
import { Corner } from "./Journey";
import { clamp, lerp, useFrame, useInViewOnce, usePointer, useStageFit, useVisible } from "./hooks";

/**
 * Amphitheatre slots in the 1600×900 frame: x/y = card centre, w = width,
 * ry = yaw toward the centre, d = depth (0 far … 1 near, drives parallax + entrance order).
 */
const SLOTS = [
  { x: 800, y: 215, w: 400, ry: 0, d: 0.45 }, // 01 hero screen
  { x: 425, y: 262, w: 300, ry: 26, d: 0.7 },
  { x: 1175, y: 262, w: 300, ry: -26, d: 0.7 },
  { x: 255, y: 410, w: 300, ry: 34, d: 0.88 },
  { x: 560, y: 470, w: 175, ry: 14, d: 0.2 },
  { x: 700, y: 482, w: 125, ry: 6, d: 0.1 },
  { x: 822, y: 484, w: 125, ry: 0, d: 0.1 },
  { x: 950, y: 482, w: 125, ry: -6, d: 0.1 },
  { x: 1085, y: 470, w: 160, ry: -14, d: 0.2 },
  { x: 1345, y: 410, w: 300, ry: -34, d: 0.88 },
  { x: 290, y: 640, w: 300, ry: 30, d: 1 },
  { x: 1310, y: 640, w: 300, ry: -30, d: 1 },
];

// entrance runs far row first; everything still reads as one rising system
const ORDER = SLOTS.map((s, i) => ({ i, d: s.d }))
  .sort((a, b) => a.d - b.d)
  .reduce<number[]>((acc, { i }, rank) => ((acc[i] = rank), acc), []);

export function Projects() {
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLUListElement>(null);
  const visible = useVisible(section);
  const seen = useInViewOnce(section, 0.3);
  const pointer = usePointer();
  const fit = useStageFit(box);
  const p = useRef({ x: 0, y: 0 });
  const { projects } = content;

  useFrame(() => {
    p.current.x = lerp(p.current.x, pointer.nx, 0.05);
    p.current.y = lerp(p.current.y, pointer.ny, 0.05);
    const el = stage.current;
    const sec = section.current;
    if (!el || !sec) return;
    const r = sec.getBoundingClientRect();
    const through = clamp(1 - r.top / window.innerHeight, 0, 2) / 2;
    el.style.setProperty("--px", p.current.x.toFixed(4));
    el.style.setProperty("--py", p.current.y.toFixed(4));
    el.style.setProperty("--dolly", (1 + through * 0.06).toFixed(4));
  }, visible);

  const { s, ox, oy, portrait } = fit;
  return (
    <section
      id="projects"
      ref={section}
      className={`projects ${seen ? "is-live" : ""} ${portrait ? "is-portrait" : ""}`}
      aria-label="Projects"
    >
      <div className="projects__room" aria-hidden>
        <div className="projects__halo" />
        <svg className="projects__floor" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
          <defs>
            <radialGradient id="pf-pool" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ff6a3d" stopOpacity="0.28" />
              <stop offset="1" stopColor="#ff6a3d" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="800" cy="770" rx="560" ry="120" fill="url(#pf-pool)" />
          <ellipse className="projects__ring" cx="800" cy="770" rx="380" ry="80" pathLength={1} />
          <ellipse className="projects__ring projects__ring--outer" cx="800" cy="770" rx="560" ry="118" pathLength={1} />
          <circle className="projects__spark" r="3" />
        </svg>
        <div className="projects__slab projects__slab--l" />
        <div className="projects__slab projects__slab--r" />
      </div>

      <div ref={box} className="projects__box">
        <div
          className="projects__stage"
          style={portrait ? undefined : { transform: `translate(${ox}px, ${oy}px) scale(${s})` }}
        >
          <ul ref={stage} className="projects__deck">
            {projects.items.map((item, i) => {
              const slot = SLOTS[i]!;
              const small = slot.w < 200;
              return (
                <li
                  key={item.title}
                  className={`pslot ${i === 0 ? "pslot--hero" : ""}`}
                  style={
                    {
                      "--x": `${slot.x}px`,
                      "--y": `${slot.y}px`,
                      "--w": `${slot.w}px`,
                      "--ry": `${slot.ry}deg`,
                      "--d": slot.d,
                      "--rank": ORDER[i],
                      "--ph": `${(i * 0.73) % 4}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className="pslot__float">
                    <a href={item.url} className={`pcard ${small ? "pcard--small" : ""}`}>
                      <span className="pcard__bar" aria-hidden>
                        <b />
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                      <span className="pcard__num">{String(i + 1).padStart(2, "0")}</span>
                      <span className="pcard__copy">
                        <span className="pcard__title">{item.title}</span>
                        {!small && <span className="pcard__tag">{item.tag}</span>}
                        <span className="pcard__btn">Explore</span>
                      </span>
                      <span className={`art art--${item.art}`} aria-hidden>
                        <i />
                        <b />
                      </span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {projects.figure && <img className="projects__figure" src={projects.figure} alt="" />}

      <Corner pos="tl" lines={[projects.label]} sub={projects.themes} />
      <Corner pos="tr" lines={projects.hint} />
      <Corner pos="bl" lines={projects.footLeft} />
      <Corner pos="br" lines={projects.footRight} />
    </section>
  );
}
