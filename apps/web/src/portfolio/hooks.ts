import { useEffect, useRef, useState, type RefObject } from "react";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Flips true once the element is meaningfully on screen (and stays true). */
export function useInViewOnce(ref: RefObject<Element | null>, threshold = 0.3) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, threshold]);
  return seen;
}

/** Live visibility, used to stop per-frame work while a scene is off screen. */
export function useVisible(ref: RefObject<Element | null>) {
  const visible = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = !!entry?.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

/** Shared pointer, normalised to -1..1 around the viewport centre, plus raw px. */
const pointer = { nx: 0, ny: 0, x: -1, y: -1, active: false };
let pointerBound = false;
export function usePointer() {
  useEffect(() => {
    if (pointerBound) return;
    pointerBound = true;
    const move = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.active = true;
    };
    window.addEventListener("pointermove", move, { passive: true });
  }, []);
  return pointer;
}

/** rAF loop that only does work while `visible` reports true. */
export function useFrame(cb: (t: number, dt: number) => void, visible?: RefObject<boolean>) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    let id = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible || visible.current) cbRef.current(now / 1000, dt);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [visible]);
}

/** Progress (0..1) of a tall pinned section: 0 when its top meets the viewport top. */
export function sectionProgress(el: HTMLElement | null) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const travel = r.height - window.innerHeight;
  if (travel <= 0) return r.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -r.top / travel));
}

/**
 * Fits a fixed design frame (default 1600×900) into its container. Returns the
 * mapping so DOM and canvas layers can share one coordinate system.
 */
export function useStageFit(
  ref: RefObject<HTMLElement | null>,
  w = 1600,
  h = 900,
  mode: "contain" | "cover" = "contain",
) {
  const [fit, setFit] = useState({ s: 1, ox: 0, oy: 0, portrait: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const s = mode === "cover" ? Math.max(cw / w, ch / h) : Math.min(cw / w, ch / h);
      setFit({ s, ox: (cw - w * s) / 2, oy: (ch - h * s) / 2, portrait: cw / ch < 0.9 || cw < 760 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, w, h, mode]);
  return fit;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
