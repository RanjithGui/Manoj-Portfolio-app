import { useEffect, useRef } from "react";

import { content } from "./content";
import { lerp, reducedMotion, sectionProgress, smooth, useFrame, useInViewOnce, usePointer, useVisible } from "./hooks";

type P = { x: number; y: number; z: number; t: number };

/**
 * Chapter two. Twelve tool cards orbit an energy core; a red light-painting
 * weaves through them in depth (drawn on two canvases — behind and in front of
 * the cards — split by each trail point's depth). The cards materialise as ONE
 * event: every card reads the same `mat` scalar.
 */
export function Universe() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const copy = useRef<HTMLDivElement>(null);
  const visible = useVisible(section);
  const seen = useInViewOnce(section, 0.25);
  const pointer = usePointer();
  const st = useRef({ t0: -1, trail: [] as P[], tilt: 0, yaw: 0, embers: [] as { x: number; y: number; v: number; r: number; p: number }[] });

  useEffect(() => {
    st.current.embers = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      v: 0.01 + Math.random() * 0.03,
      r: 0.4 + Math.random() * 1.6,
      p: Math.random() * 6.28,
    }));
  }, []);

  useFrame((t) => {
    const s = st.current;
    const el = stage.current;
    const bc = back.current;
    const fc = front.current;
    if (!el || !bc || !fc) return;
    if (seen && s.t0 < 0) s.t0 = t;
    const local = s.t0 < 0 ? 0 : reducedMotion() ? 99 : t - s.t0;
    const mat = smooth((local - 0.3) / 1.8);
    const life = smooth((local - 1.6) / 1.2);

    const w = el.clientWidth;
    const h = el.clientHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    for (const c of [bc, fc]) {
      if (c.width !== Math.round(w * dpr)) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
    }

    const prog = sectionProgress(section.current);
    el.style.setProperty("--dolly", String(0.94 + prog * 0.12));
    if (copy.current) copy.current.style.opacity = String(mat * (1 - smooth((prog - 0.75) / 0.25)));

    s.tilt = lerp(s.tilt, pointer.ny * 6, 0.05);
    s.yaw = lerp(s.yaw, pointer.nx * 0.25, 0.04);

    const cx = w / 2;
    const cy = h * 0.56;
    const rx = Math.min(w * 0.4, 640);
    const ry = rx * (0.2 + s.tilt * 0.012);
    const n = cards.current.length;

    // cards: a slow orbit, a dephased float, all gated by one `mat`
    cards.current.forEach((card, i) => {
      if (!card) return;
      const a = (i / n) * Math.PI * 2 + t * 0.06 * life + s.yaw;
      const z = Math.sin(a);
      const x = cx + Math.cos(a) * rx;
      const y = cy + z * ry - h * 0.06 + Math.sin(t * 0.8 + i * 1.7) * 6 * life;
      const depth = (z + 1) / 2;
      const scale = (0.62 + depth * 0.5) * (0.85 + mat * 0.15);
      const rise = (1 - mat) * (h * 0.45 + i * 0); // one event: no per-card stagger
      card.style.transform = `translate3d(${x}px, ${y + rise}px, 0) translate(-50%, -50%) rotateY(${Math.cos(a) * -28}deg) scale(${scale})`;
      card.style.opacity = String(mat * (0.35 + depth * 0.65));
      card.style.filter = `blur(${(1 - mat) * 10 + (1 - depth) * 1.2}px) brightness(${0.55 + depth * 0.55})`;
      card.style.zIndex = String(z > 0 ? 30 + Math.round(depth * 10) : Math.round(depth * 10));
    });

    // the light-painting head: an orbit with incommensurate drifts so it never visibly repeats
    const ha = t * 0.85;
    const head: P = {
      x: cx + Math.cos(ha) * rx * (0.82 + Math.sin(t * 0.31) * 0.22),
      y: cy + Math.sin(ha) * ry * 1.4 + Math.sin(t * 0.53) * h * 0.13 - h * 0.08,
      z: Math.sin(ha),
      t,
    };
    s.trail.push(head);
    while (s.trail.length && t - s.trail[0]!.t > 7) s.trail.shift();

    const bx = bc.getContext("2d")!;
    const fx = fc.getContext("2d")!;
    bx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bx.clearRect(0, 0, w, h);
    fx.clearRect(0, 0, w, h);

    // embers
    bx.globalCompositeOperation = "lighter";
    for (const e of s.embers) {
      e.y -= e.v * 0.016;
      if (e.y < -0.02) e.y = 1.02;
      const ex = e.x * w + Math.sin(t * 0.4 + e.p) * 14;
      const ey = e.y * h;
      const near = Math.max(0, 1 - Math.hypot(ex - head.x, ey - head.y) / 220);
      bx.fillStyle = `rgba(255,${90 + near * 120},${70 + near * 80},${(0.25 + near * 0.7) * mat})`;
      bx.beginPath();
      bx.arc(ex, ey, e.r * (1 + near * 1.5), 0, 6.283);
      bx.fill();
    }

    // trail: white-hot at the head, cooling to salmon and then dark red with age
    const draw = (ctx: CanvasRenderingContext2D, front: boolean) => {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 1; i < s.trail.length; i++) {
          const a = s.trail[i - 1]!;
          const b = s.trail[i]!;
          if (b.z >= 0 !== front) continue;
          const age = (t - b.t) / 7;
          const k = 1 - age;
          const r = 255;
          const g = Math.round(lerp(40, 235, k * k * k));
          const bl = Math.round(lerp(30, 215, k * k * k * k));
          ctx.strokeStyle = `rgba(${r},${g},${bl},${(pass ? 0.9 : 0.12) * k * life})`;
          ctx.lineWidth = (pass ? 1.6 : 12) * (0.4 + k * 0.9);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    };
    draw(bx, false);
    draw(fx, true);

    // head glow
    const g = (head.z >= 0 ? fx : bx).createRadialGradient(head.x, head.y, 0, head.x, head.y, 60);
    g.addColorStop(0, `rgba(255,240,230,${0.9 * life})`);
    g.addColorStop(0.2, `rgba(255,80,60,${0.4 * life})`);
    g.addColorStop(1, "rgba(255,0,0,0)");
    const hc = head.z >= 0 ? fx : bx;
    hc.fillStyle = g;
    hc.fillRect(head.x - 60, head.y - 60, 120, 120);

    el.style.setProperty("--core", String(mat));
    el.style.setProperty("--blush", String(0.4 + 0.6 * Math.max(0, 1 - Math.abs(head.x - cx) / rx) * life));
  }, visible);

  const { universe } = content;
  return (
    <section id="universe" ref={section} className="universe" aria-label={universe.title}>
      <div className="universe__pin">
        <div ref={stage} className={`universe__stage ${seen ? "is-live" : ""}`}>
          <div className="universe__wall" aria-hidden />
          <div className="universe__floor" aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <canvas ref={back} className="universe__canvas" aria-hidden />
          <div className="universe__core" aria-hidden>
            <i />
            <i />
            <b />
          </div>
          <ul className="universe__cards">
            {universe.tools.map((tool, i) => (
              <li key={tool.name}>
                <div
                  ref={(n) => {
                    cards.current[i] = n;
                  }}
                  className="tool"
                  style={{ "--tint": tool.tint } as React.CSSProperties}
                >
                  <span className="tool__mark">{tool.mark}</span>
                  <span className="tool__name">{tool.name}</span>
                </div>
              </li>
            ))}
          </ul>
          <canvas ref={front} className="universe__canvas universe__canvas--front" aria-hidden />
        </div>
        <div ref={copy} className="universe__copy">
          <p className="kicker">{universe.kicker}</p>
          <h2>{universe.title}</h2>
          <p>{universe.line}</p>
        </div>
      </div>
    </section>
  );
}
