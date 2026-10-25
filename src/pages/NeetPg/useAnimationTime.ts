import { useEffect, useRef, useState } from 'react';

/** Elapsed animation time in seconds, advancing only while `playing` is true. */
export function useAnimationTime(playing: boolean, speed = 1) {
  const [time, setTime] = useState(0);
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = (now: number) => {
      if (last.current !== null) {
        const step = Math.min((now - last.current) / 1000, 0.1) * speed;
        setTime((value) => value + step);
      }
      last.current = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      last.current = null;
    };
  }, [playing, speed]);
  return time;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** 0 → 1 as u moves from a to b, eased. */
export const ease = (a: number, b: number, u: number) => {
  const x = clamp01((u - a) / (b - a));
  return x * x * (3 - 2 * x);
};
/** Linear 0 → 1 as u moves from a to b. */
export const ramp = (a: number, b: number, u: number) => clamp01((u - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Pt = [number, number];

/** Point at fraction t along a polyline. */
export function along(points: Pt[], t: number): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((sum, l) => sum + l, 0);
  let target = clamp01(t) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (target <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(target / lengths[i], 1) : 0;
      return [lerp(points[i][0], points[i + 1][0], f), lerp(points[i][1], points[i + 1][1], f)];
    }
    target -= lengths[i];
  }
  return points[points.length - 1];
}

/** Samples a cubic Bézier into a polyline. */
export function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, steps = 40): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const m = 1 - t;
    return [
      m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
      m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ] as Pt;
  });
}

export const toPath = (points: Pt[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
