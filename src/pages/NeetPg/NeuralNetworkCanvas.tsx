import React, { useEffect, useRef } from 'react';

interface Neuron { x: number; y: number; vx: number; vy: number; r: number; flash: number; spikes: number[] }
interface Impulse { from: number; to: number; t: number; speed: number }

const LINK_DISTANCE = 150;

/**
 * Hero motion graphic: neurons drift, grow axons towards neighbours, form synapses
 * and pass glowing impulses that can trigger chain reactions through the network.
 */
const NeuralNetworkCanvas: React.FC<{ className?: string }> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let neurons: Neuron[] = [];
    const growth = new Map<string, number>();
    let impulses: Impulse[] = [];
    let frame = 0;
    let visible = true;
    let last = performance.now();

    const seed = () => {
      const count = Math.round(Math.min(70, Math.max(24, (width * height) / 16000)));
      neurons = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        r: 2.6 + Math.random() * 2.6,
        flash: 0,
        spikes: Array.from({ length: 5 }, () => Math.random() * Math.PI * 2),
      }));
      growth.clear();
      impulses = [];
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, width, height);
      // Drift.
      for (const n of neurons) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -20 || n.x > width + 20) n.vx *= -1;
        if (n.y < -20 || n.y > height + 20) n.vy *= -1;
        n.flash = Math.max(0, n.flash - dt * 1.6);
      }
      // Grow or retract connections between nearby neurons.
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const a = neurons[i];
          const b = neurons[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const k = key(i, j);
          const g = growth.get(k) ?? 0;
          const next = d < LINK_DISTANCE ? Math.min(1, g + dt * 0.45) : Math.max(0, g - dt * 0.8);
          if (next <= 0) { growth.delete(k); continue; }
          growth.set(k, next);
          const fade = 1 - d / (LINK_DISTANCE * 1.4);
          const ex = a.x + (b.x - a.x) * next;
          const ey = a.y + (b.y - a.y) * next;
          ctx.strokeStyle = `rgba(212,175,55,${0.08 + 0.32 * fade * next})`;
          ctx.lineWidth = 0.6 + next * 0.7;
          ctx.beginPath();
          // A slight curve makes the links read as axons rather than straight wires.
          const mx = (a.x + ex) / 2 + (ey - a.y) * 0.12;
          const my = (a.y + ey) / 2 - (ex - a.x) * 0.12;
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, ex, ey);
          ctx.stroke();
          if (next >= 1) {
            ctx.fillStyle = `rgba(241,215,138,${0.35 * fade + 0.2})`;
            ctx.beginPath();
            ctx.arc(b.x + (a.x - b.x) * 0.06, b.y + (a.y - b.y) * 0.06, 1.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Growth cone at the tip of a growing axon.
            ctx.fillStyle = 'rgba(255,240,190,.85)';
            ctx.beginPath();
            ctx.arc(ex, ey, 1.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      // Fire new impulses along mature synapses.
      if (Math.random() < dt * 3.5) {
        const mature = [...growth.entries()].filter(([, g]) => g >= 1);
        if (mature.length) {
          const [k] = mature[Math.floor(Math.random() * mature.length)];
          const [a, b] = k.split('-').map(Number);
          impulses.push(Math.random() < 0.5 ? { from: a, to: b, t: 0, speed: 0.9 + Math.random() } : { from: b, to: a, t: 0, speed: 0.9 + Math.random() });
          neurons[impulses[impulses.length - 1].from].flash = 1;
        }
      }
      const arrived: Impulse[] = [];
      impulses = impulses.filter((imp) => {
        imp.t += dt * imp.speed;
        if ((growth.get(key(imp.from, imp.to)) ?? 0) < 1) return false;
        if (imp.t >= 1) { arrived.push(imp); return false; }
        const a = neurons[imp.from];
        const b = neurons[imp.to];
        const x = a.x + (b.x - a.x) * imp.t;
        const y = a.y + (b.y - a.y) * imp.t;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, 'rgba(255,244,204,1)');
        glow.addColorStop(0.35, 'rgba(241,215,138,.6)');
        glow.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      // Arrival excites the receiving neuron, which sometimes passes the signal on.
      for (const imp of arrived) {
        neurons[imp.to].flash = 1;
        if (impulses.length < 60 && Math.random() < 0.7) {
          for (const [k, g] of growth) {
            if (g < 1) continue;
            const [a, b] = k.split('-').map(Number);
            if ((a === imp.to && b !== imp.from) || (b === imp.to && a !== imp.from)) {
              if (Math.random() < 0.45) impulses.push({ from: imp.to, to: a === imp.to ? b : a, t: 0, speed: 0.9 + Math.random() });
            }
          }
        }
      }
      // Somata with short dendrites.
      for (const n of neurons) {
        const glow = n.flash;
        ctx.strokeStyle = `rgba(212,175,55,${0.35 + glow * 0.5})`;
        ctx.lineWidth = 0.8;
        for (const angle of n.spikes) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n.x + Math.cos(angle) * (n.r + 6), n.y + Math.sin(angle) * (n.r + 6));
          ctx.stroke();
        }
        if (glow > 0) {
          const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 26 * glow + 6);
          halo.addColorStop(0, `rgba(255,236,170,${0.7 * glow})`);
          halo.addColorStop(1, 'rgba(212,175,55,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 26 * glow + 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = glow > 0.2 ? '#eaf0ff' : '#7da2ff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (visible) draw(dt);
      frame = requestAnimationFrame(loop);
    };

    resize();
    if (reduced) {
      // Grow the network fully once and show a still frame.
      for (let i = 0; i < 60; i++) draw(0.05);
    } else {
      frame = requestAnimationFrame(loop);
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; last = performance.now(); });
    observer.observe(canvas);
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default NeuralNetworkCanvas;
