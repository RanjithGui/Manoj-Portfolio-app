import { useMemo, useRef, useState } from "react";

import { content } from "./content";
import { clamp, lerp, reducedMotion, smooth, useFrame, useInViewOnce, usePointer, useStageFit, useVisible } from "./hooks";

// Design frame is 1600×900. Nodes sit on a descending curve that flattens to the right.
const NODES: [number, number][] = [
  [356, 150],
  [520, 222],
  [690, 272],
  [870, 304],
  [1070, 324],
  [1290, 330],
];
const PIVOT: [number, number] = [1150, 24];
const HAND = 270;
const CARD_W = [146, 152, 158, 164, 170, 182];

/** Smooth path through the nodes (with extrapolated ends) using midpoint quadratics. */
function railPath() {
  const first = NODES[0]!;
  const second = NODES[1]!;
  const last = NODES[NODES.length - 1]!;
  const pts: [number, number][] = [
    [first[0] - (second[0] - first[0]) * 0.9, first[1] - (second[1] - first[1]) * 1.1],
    ...NODES,
    [last[0] + 420, last[1] - 10],
  ];
  let d = `M${pts[0]![0]},${pts[0]![1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]!;
    const [nx, ny] = pts[i + 1]!;
    d += ` Q${x},${y} ${(x + nx) / 2},${(y + ny) / 2}`;
  }
  const end = pts[pts.length - 1]!;
  return `${d} L${end[0]},${end[1]}`;
}

const cardCenter = (i: number): [number, number] => [NODES[i]![0], NODES[i]![1] + 30 + CARD_W[i]! * 0.78];

/** Point at continuous position u (0..5) along the node polyline. */
function at(u: number): [number, number] {
  const i = Math.min(4, Math.floor(clamp(u, 0, 5)));
  const f = clamp(u, 0, 5) - i;
  const a = NODES[i]!;
  const b = NODES[i + 1]!;
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
}

/**
 * Cursor → continuous year. Projecting onto the polyline through the CARD centres
 * (not raw x) means a pointer high above the rail still picks the right year.
 */
function project(x: number, y: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < 5; i++) {
    const [ax, ay] = cardCenter(i);
    const [bx, by] = cardCenter(i + 1);
    const dx = bx - ax;
    const dy = by - ay;
    const f = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy));
    const d = Math.hypot(ax + dx * f - x, ay + dy * f - y);
    if (d < bestD) {
      bestD = d;
      best = i + f;
    }
  }
  return best;
}

export function Journey() {
  const section = useRef<HTMLElement>(null);
  const stageBox = useRef<HTMLDivElement>(null);
  const hand = useRef<SVGGElement>(null);
  const beam = useRef<SVGPathElement>(null);
  const flood = useRef<SVGCircleElement>(null);
  const visible = useVisible(section);
  const seen = useInViewOnce(section, 0.3);
  const pointer = usePointer();
  const fit = useStageFit(stageBox);
  const [active, setActive] = useState(5);
  const st = useRef({ t0: -1, u: 0, target: 5, picked: -1 });
  const rail = useMemo(railPath, []);
  const { journey } = content;

  useFrame((t) => {
    const s = st.current;
    if (seen && s.t0 < 0) s.t0 = t;
    const local = s.t0 < 0 ? 0 : reducedMotion() ? 99 : t - s.t0;

    // the intro owns the hand, then authority is handed to the pointer on a ramp
    const introU = 5 * smooth((local - 1.4) / 1.8);
    const box = stageBox.current;
    if (box && pointer.active && s.picked < 0) {
      const r = box.getBoundingClientRect();
      if (pointer.y >= r.top && pointer.y <= r.bottom) {
        s.target = project((pointer.x - r.left - fit.ox) / fit.s, (pointer.y - r.top - fit.oy) / fit.s);
      }
    }
    if (s.picked >= 0) s.target = s.picked;
    const authority = smooth((local - 3.2) / 1.0);
    const goal = lerp(introU, s.target, authority);
    s.u = lerp(s.u, goal, 0.08);

    const idx = Math.round(s.u);
    if (local > 1.4) setActive((a) => (a === idx ? a : idx));

    const [tx, ty] = at(s.u);
    const ang = Math.atan2(ty - PIVOT[1], tx - PIVOT[0]);
    hand.current?.setAttribute("transform", `translate(${PIVOT[0]},${PIVOT[1]}) rotate(${(ang * 180) / Math.PI})`);
    const c = Math.cos(ang);
    const sn = Math.sin(ang);
    const tipX = PIVOT[0] + c * HAND;
    const tipY = PIVOT[1] + sn * HAND;
    const [nx, ny] = at(idx + (s.u - idx) * 0.35);
    const spread = 38;
    beam.current?.setAttribute(
      "d",
      `M${tipX - sn * 3},${tipY + c * 3} L${tipX + sn * 3},${tipY - c * 3} L${nx + sn * spread},${ny - c * spread} L${nx - sn * spread},${ny + c * spread} Z`,
    );
    flood.current?.setAttribute("cx", String(nx));
    flood.current?.setAttribute("cy", String(ny));
  }, visible);

  const pick = (i: number) => {
    st.current.picked = i;
    setActive(i);
  };
  const release = () => {
    st.current.picked = -1;
  };

  const { s, ox, oy, portrait } = fit;
  return (
    <section
      id="journey"
      ref={section}
      className={`journey ${seen ? "is-live" : ""} ${portrait ? "is-portrait" : ""}`}
      aria-label="A journey through time"
    >
      <div className="journey__room" aria-hidden>
        <div className="journey__floor">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div ref={stageBox} className="journey__box" onPointerLeave={release}>
        <div className="journey__stage" style={{ transform: `translate(${ox}px, ${oy}px) scale(${s})` }}>
          <svg className="journey__svg" viewBox="0 0 1600 900" aria-hidden>
            <defs>
              <radialGradient id="jr-face" cx="0.5" cy="0.4" r="0.6">
                <stop offset="0" stopColor="#1b0f0b" />
                <stop offset="1" stopColor="#070404" />
              </radialGradient>
              <linearGradient id="jr-beam" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff4632" stopOpacity="0.85" />
                <stop offset="1" stopColor="#c8120c" stopOpacity="0.28" />
              </linearGradient>
              <linearGradient id="jr-brass" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#f6dcc0" />
                <stop offset="1" stopColor="#a87a55" />
              </linearGradient>
              <radialGradient id="jr-ball" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#fff3e2" />
                <stop offset="0.5" stopColor="#d9b48d" />
                <stop offset="1" stopColor="#5c3b25" />
              </radialGradient>
              <radialGradient id="jr-flood">
                <stop offset="0" stopColor="#ff3b2a" stopOpacity="0.7" />
                <stop offset="1" stopColor="#ff3b2a" stopOpacity="0" />
              </radialGradient>
              <filter id="jr-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g className="journey__clock">
              <circle cx={PIVOT[0]} cy={PIVOT[1]} r="420" fill="url(#jr-face)" stroke="#5a3424" strokeWidth="2" />
              <circle cx={PIVOT[0]} cy={PIVOT[1]} r="404" fill="none" stroke="#2a1812" strokeWidth="1" />
              {Array.from({ length: 60 }, (_, i) => {
                const a = (i / 60) * Math.PI * 2;
                const long = i % 5 === 0;
                const r1 = long ? 372 : 386;
                return (
                  <line
                    key={i}
                    x1={PIVOT[0] + Math.cos(a) * r1}
                    y1={PIVOT[1] + Math.sin(a) * r1}
                    x2={PIVOT[0] + Math.cos(a) * 398}
                    y2={PIVOT[1] + Math.sin(a) * 398}
                    stroke={long ? "#8c5a41" : "#3d241a"}
                    strokeWidth={long ? 3 : 1.5}
                  />
                );
              })}
            </g>

            <path ref={beam} className="journey__beam" fill="url(#jr-beam)" />
            <circle ref={flood} className="journey__flood" r="70" fill="url(#jr-flood)" />

            <path className="journey__rail journey__rail--glow" d={rail} />
            <path className="journey__rail" d={rail} pathLength={1} />

            {NODES.map(([x, y], i) => (
              <g key={i} className={`journey__node ${i === active ? "is-on" : ""}`}>
                <circle cx={x} cy={y} r="14" className="journey__halo" />
                <circle cx={x} cy={y} r="5" className="journey__dot" filter="url(#jr-glow)" />
                <text x={x - 6} y={y + 52} className="journey__year">
                  {journey.years[i]!.year}
                </text>
              </g>
            ))}

            <g className="journey__hands">
              <g ref={hand}>
                {/* primary: a long bright needle */}
                <path d={`M-14,-5 L${HAND},-1.6 L${HAND + 6},0 L${HAND},1.6 L-14,5 Z`} fill="url(#jr-brass)" />
                {/* companion: rides 74° behind, with a pierced ornament part-way down */}
                <g transform="rotate(-74)">
                  <path d="M-10,-4 L230,-1.2 L246,0 L230,1.2 L-10,4 Z" fill="url(#jr-brass)" opacity="0.92" />
                  <g transform="translate(108,0)">
                    <circle r="11" fill="url(#jr-brass)" />
                    <circle r="5" fill="#120a07" />
                    <path d="M-4,0 L4,0 M0,-4 L0,4" stroke="#d9b48d" strokeWidth="1.5" />
                  </g>
                </g>
              </g>
              <circle cx={PIVOT[0]} cy={PIVOT[1]} r="20" fill="url(#jr-ball)" />
            </g>
          </svg>

          <ol className="journey__cards">
            {journey.years.map((y, i) => {
              const [x, ny] = NODES[i]!;
              const w = CARD_W[i]!;
              return (
                <li key={y.year} style={{ left: x - w / 2, top: ny + 72, width: w }}>
                  <button
                    type="button"
                    className={`ycard ${i === active ? "is-active" : ""}`}
                    onClick={() => pick(i)}
                    onFocus={() => pick(i)}
                    onMouseEnter={() => pick(i)}
                    onMouseLeave={release}
                    aria-pressed={i === active}
                  >
                    <span className={`ycard__art ycard__art--${y.scene}`} aria-hidden>
                      <i />
                      <b />
                    </span>
                    <span className="ycard__year">{y.year}</span>
                    <span className="ycard__title">{y.title}</span>
                    {y.lines.map((l) => (
                      <span key={l} className="ycard__line">
                        {l}
                      </span>
                    ))}
                    {i === 5 && <span className="ycard__go" aria-hidden>↗</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* portrait recomposition: a vertical rail of years beside one staged card */}
        <div className="journey__portrait">
          <ol className="journey__rail-v">
            {journey.years.map((y, i) => (
              <li key={y.year}>
                <button type="button" className={i === active ? "is-on" : ""} onClick={() => pick(i)}>
                  {y.year}
                </button>
              </li>
            ))}
          </ol>
          {(() => {
            const y = journey.years[active]!;
            return (
              <div className="ycard is-active ycard--solo" key={y.year}>
                <span className={`ycard__art ycard__art--${y.scene}`} aria-hidden>
                  <i />
                  <b />
                </span>
                <span className="ycard__year">{y.year}</span>
                <span className="ycard__title">{y.title}</span>
                {y.lines.map((l) => (
                  <span key={l} className="ycard__line">
                    {l}
                  </span>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {journey.figure && <img className="journey__figure" src={journey.figure} alt="" />}

      <Corner pos="tl" big lines={journey.title} sub={journey.themes} />
      <Corner pos="tr" lines={journey.hint} />
      <Corner pos="bl" lines={journey.footLeft} />
      <Corner pos="br" lines={journey.footRight} />
    </section>
  );
}

export function Corner({ pos, lines, sub, big }: { pos: "tl" | "tr" | "bl" | "br"; lines: string[]; sub?: string[]; big?: boolean }) {
  return (
    <div className={`corner corner--${pos} ${big ? "corner--big" : ""}`}>
      <p>
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </p>
      <i />
      {sub && (
        <>
          <p className="corner__sub">
            {sub.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </p>
          <i />
        </>
      )}
    </div>
  );
}
