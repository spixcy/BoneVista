import React from 'react';
import { along, bezier, clamp01, ease, lerp, ramp, toPath, type Pt } from './useAnimationTime';
import styles from './NeetPgPage.module.css';

/* Every animation is a pure function of u ∈ [0, 1): the position within one loop. */
type AnimProps = { u: number };

const ACCENT = '#7da2ff';
const SOFT = '#a9c1ff';
const IVORY = '#efe6d1';
const DIM = 'rgba(125,162,255,.25)';
const CA = '#e8806f';
const K = '#8fc7d8';
const MUTED = '#7b7568';

const Glow: React.FC<{ id: string; blur?: number }> = ({ id, blur = 4 }) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={blur} result="b" />
    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>
);

const T: React.FC<{ x: number; y: number; on?: boolean; anchor?: 'start' | 'middle' | 'end'; children: React.ReactNode }> = ({ x, y, on, anchor = 'start', children }) => (
  <text x={x} y={y} textAnchor={anchor} className={on ? styles.svgLabelOn : styles.svgLabel}>{children}</text>
);

/** The visited part of a polyline, for drawing a bright trail behind a moving impulse. */
const slice = (points: Pt[], t: number): Pt[] => {
  if (t <= 0) return [points[0]];
  const n = points.length - 1;
  const cut = clamp01(t) * n;
  const whole = Math.floor(cut);
  return [...points.slice(0, whole + 1), along(points.slice(whole, Math.min(whole + 2, points.length)), cut - whole)];
};

const Pulse: React.FC<{ at: Pt; r?: number; color?: string; filter: string; opacity?: number }> = ({ at, r = 7, color = SOFT, filter, opacity = 1 }) => (
  <circle cx={at[0]} cy={at[1]} r={r} fill={color} filter={`url(#${filter})`} opacity={opacity} />
);

/* ─── 1. Neuron & saltatory conduction ─────────────── */

const DENDRITES: Pt[][] = [
  [[20, 110], [60, 140], [96, 190]],
  [[14, 225], [84, 225]],
  [[24, 345], [62, 310], [96, 262]],
  [[96, 70], [112, 130], [122, 180]],
  [[104, 385], [116, 320], [124, 270]],
];
const MYELIN = [222, 304, 386, 468, 550, 632];
const NODES = [205, 296, 378, 460, 542, 624, 705];

export const NeuronConduction: React.FC<AnimProps> = ({ u }) => {
  const input = ramp(0, 0.16, u);
  const somaGlow = ease(0.1, 0.18, u) * (1 - ease(0.26, 0.4, u));
  const hillock = ease(0.15, 0.22, u) * (1 - ease(0.3, 0.4, u));
  const jumps = ramp(0.24, 0.84, u) * (NODES.length - 1);
  const j = Math.min(Math.floor(jumps), NODES.length - 2);
  const f = jumps - j;
  const conducting = u >= 0.24 && u < 0.86;
  const terminals = ease(0.82, 0.88, u) * (1 - ease(0.94, 1, u));
  const slow = 210 + ramp(0.24, 1, u) * 490 * 0.42;
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs><Glow id="nc-glow" /></defs>
      <T x={210} y={150} on={conducting}>MYELINATED · SALTATORY (FAST)</T>
      {DENDRITES.map((d, i) => (
        <g key={i}>
          <path d={toPath(d)} stroke={ACCENT} strokeOpacity={0.55} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={toPath([d[0], [d[0][0] - 10, d[0][1] - 12]])} stroke={ACCENT} strokeOpacity={0.4} strokeWidth={2} />
          {input > 0 && input < 1 && <Pulse at={along(d, input)} r={4.5} filter="nc-glow" />}
        </g>
      ))}
      <circle cx={130} cy={225} r={46} fill="rgba(125,162,255,.12)" stroke={ACCENT} strokeWidth={2} />
      <circle cx={130} cy={225} r={46} fill={SOFT} opacity={somaGlow * 0.35} filter="url(#nc-glow)" />
      <circle cx={124} cy={220} r={15} fill="rgba(239,230,209,.25)" stroke={IVORY} strokeOpacity={0.6} />
      <circle cx={127} cy={217} r={4} fill={IVORY} opacity={0.7} />
      {[[104, 200], [150, 246], [112, 252], [152, 204]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={2.2} fill={IVORY} opacity={0.5} />)}
      <path d="M176,212 L210,219 L210,231 L176,238 Z" fill={hillock > 0.05 ? SOFT : 'rgba(125,162,255,.35)'} opacity={0.35 + hillock * 0.65} filter={hillock > 0.05 ? 'url(#nc-glow)' : undefined} />
      <line x1={205} y1={225} x2={700} y2={225} stroke={IVORY} strokeWidth={3} strokeOpacity={0.7} />
      {MYELIN.map((x) => <rect key={x} x={x} y={213} width={66} height={24} rx={11} fill="rgba(239,230,209,.16)" stroke={IVORY} strokeOpacity={0.55} />)}
      {NODES.slice(1, -1).map((x, i) => <circle key={x} cx={x} cy={225} r={3} fill={conducting && i < j ? 'rgba(232,128,111,.8)' : MUTED} />)}
      {conducting && (
        <>
          <path d={`M${NODES[j]},214 Q${(NODES[j] + NODES[j + 1]) / 2},178 ${NODES[j + 1]},214`} stroke={SOFT} strokeWidth={1.6} strokeDasharray="4 5" fill="none" opacity={1 - f} />
          <Pulse at={[NODES[j + 1], 225]} r={6 + 5 * Math.sin(f * Math.PI)} filter="nc-glow" opacity={0.4 + 0.6 * f} />
        </>
      )}
      {[[760, 170], [772, 225], [760, 280]].map(([x, y]) => (
        <g key={y}>
          <path d={`M700,225 Q735,${(225 + y) / 2} ${x},${y}`} stroke={IVORY} strokeOpacity={0.6} strokeWidth={2} fill="none" />
          <circle cx={x} cy={y} r={9} fill={terminals > 0.05 ? SOFT : 'rgba(125,162,255,.3)'} filter={terminals > 0.05 ? 'url(#nc-glow)' : undefined} opacity={0.5 + terminals * 0.5} />
        </g>
      ))}
      <line x1={210} y1={395} x2={700} y2={395} stroke={IVORY} strokeOpacity={0.45} strokeWidth={2} />
      <line x1={210} y1={395} x2={slow} y2={395} stroke={SOFT} strokeWidth={3} opacity={u > 0.24 ? 0.8 : 0} />
      {u > 0.24 && <Pulse at={[slow, 395]} r={5} filter="nc-glow" />}
      <T x={210} y={372}>UNMYELINATED · CONTINUOUS (SLOW) — SAME TIME, LESS DISTANCE</T>
      <T x={14} y={92} on={input > 0 && input < 1}>Dendrites</T>
      <T x={180} y={300} on={somaGlow > 0.3}>Soma · Nissl bodies</T>
      <T x={214} y={203} on={hillock > 0.3}>Axon hillock · trigger zone</T>
      <T x={337} y={262} anchor="middle">Myelin sheath</T>
      <T x={460} y={262} anchor="middle" on={conducting}>Node of Ranvier</T>
      <T x={782} y={140} anchor="end" on={terminals > 0.3}>Axon terminals</T>
    </svg>
  );
};

/* ─── 2. Action potential ───────────────────────────── */

const AP_KEYS: [number, number][] = [[0, -70], [0.16, -70], [0.22, -56], [0.245, -50], [0.3, 32], [0.33, 26], [0.44, -70], [0.52, -84], [0.68, -70], [1, -70]];
const voltage = (u: number) => {
  for (let i = 1; i < AP_KEYS.length; i++) {
    const [u0, v0] = AP_KEYS[i - 1];
    const [u1, v1] = AP_KEYS[i];
    if (u <= u1) return lerp(v0, v1, ease(u0, u1, u));
  }
  return -70;
};
const gx = (u: number) => 80 + u * 680;
const vy = (v: number) => 40 + (40 - v) * 2;
const AP_TRACE: Pt[] = Array.from({ length: 241 }, (_, i) => [gx(i / 240), vy(voltage(i / 240))]);

export const ActionPotential: React.FC<AnimProps> = ({ u }) => {
  const naOpen = u >= 0.235 && u < 0.31;
  const naInactive = u >= 0.31 && u < 0.46;
  const kOpen = u >= 0.29 && u < 0.56;
  const pump = ease(0.55, 0.62, u) * (1 - ease(0.95, 1, u));
  const drawn = AP_TRACE.filter(([x]) => x <= gx(u));
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs><Glow id="ap-glow" /></defs>
      <rect x={gx(0.245)} y={40} width={gx(0.4) - gx(0.245)} height={260} fill="rgba(232,128,111,.08)" />
      <rect x={gx(0.4)} y={40} width={gx(0.58) - gx(0.4)} height={260} fill="rgba(125,162,255,.05)" />
      <T x={(gx(0.245) + gx(0.4)) / 2} y={56} anchor="middle" on={u > 0.245 && u < 0.4}>ARP</T>
      <T x={(gx(0.4) + gx(0.58)) / 2} y={56} anchor="middle" on={u > 0.4 && u < 0.58}>RRP</T>
      {[30, 0, -55, -70, -90].map((v) => (
        <g key={v}>
          <line x1={80} x2={760} y1={vy(v)} y2={vy(v)} stroke={v === -55 ? CA : 'rgba(255,255,255,.08)'} strokeDasharray={v === -55 ? '6 6' : undefined} />
          <T x={72} y={vy(v) + 4} anchor="end">{v > 0 ? `+${v}` : v}</T>
        </g>
      ))}
      <T x={760} y={vy(-55) - 6} anchor="end" on={u > 0.16 && u < 0.26}>Threshold −55 mV</T>
      <T x={760} y={vy(-70) + 16} anchor="end" on={u < 0.16 || u > 0.68}>Resting −70 mV</T>
      <path d={toPath(AP_TRACE)} stroke={DIM} strokeWidth={2} fill="none" />
      {drawn.length > 1 && <path d={toPath(drawn)} stroke={SOFT} strokeWidth={3} fill="none" filter="url(#ap-glow)" />}
      <Pulse at={[gx(u), vy(voltage(u))]} r={6} filter="ap-glow" />
      <T x={gx(0.27)} y={vy(34) - 8} anchor="middle" on={naOpen}>Na⁺ in → depolarisation</T>
      <T x={gx(0.44) + 8} y={vy(-30)} on={kOpen}>K⁺ out → repolarisation</T>
      <T x={gx(0.52)} y={vy(-84) + 18} anchor="middle" on={u > 0.44 && u < 0.62}>Hyperpolarisation</T>

      {/* Membrane with channels */}
      <T x={80} y={344}>OUTSIDE</T>
      <T x={80} y={446}>INSIDE</T>
      {Array.from({ length: 44 }, (_, i) => 160 + i * 14).filter((x) => Math.abs(x - 300) > 26 && Math.abs(x - 520) > 26).map((x) => (
        <g key={x}><circle cx={x} cy={362} r={5} fill="rgba(239,230,209,.35)" /><circle cx={x} cy={414} r={5} fill="rgba(239,230,209,.35)" /><line x1={x} x2={x} y1={367} y2={409} stroke="rgba(239,230,209,.12)" /></g>
      ))}
      {[{ x: 300, open: naOpen, label: 'Voltage-gated Na⁺', color: SOFT }, { x: 520, open: kOpen, label: 'Voltage-gated K⁺', color: K }].map((ch) => (
        <g key={ch.x}>
          <rect x={ch.x - 24} y={356} width={14} height={64} rx={4} fill={ch.open ? ch.color : 'rgba(125,162,255,.35)'} opacity={ch.open ? 0.9 : 1} />
          <rect x={ch.x + 10} y={356} width={14} height={64} rx={4} fill={ch.open ? ch.color : 'rgba(125,162,255,.35)'} opacity={ch.open ? 0.9 : 1} />
          {!ch.open && <rect x={ch.x - 10} y={384} width={20} height={8} fill="rgba(125,162,255,.35)" />}
          <T x={ch.x} y={466} anchor="middle" on={ch.open}>{ch.label}</T>
        </g>
      ))}
      {naInactive && <circle cx={300} cy={428} r={8} fill={CA} opacity={0.85} />}
      {naInactive && <T x={318} y={446} on>inactivation gate</T>}
      {Array.from({ length: 6 }, (_, i) => {
        const p = ease(0.235 + i * 0.008, 0.31 + i * 0.008, u);
        if (u > 0.6 || p <= 0) return u <= 0.235 || u > 0.6 ? <circle key={i} cx={288 + (i % 3) * 12} cy={330 + Math.floor(i / 3) * 10} r={4} fill={SOFT} opacity={0.75} /> : null;
        return <circle key={i} cx={294 + (i % 3) * 6} cy={lerp(330, 436, p)} r={4} fill={SOFT} filter="url(#ap-glow)" />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const p = ease(0.3 + i * 0.012, 0.5 + i * 0.012, u);
        if (u > 0.6) return <circle key={i} cx={508 + (i % 3) * 12} cy={436 + Math.floor(i / 3) * 10} r={4} fill={K} opacity={0.75} />;
        return <circle key={i} cx={514 + (i % 3) * 6} cy={lerp(436, 330, p)} r={4} fill={K} opacity={0.9} />;
      })}
      <g transform={`translate(690,388) rotate(${pump * u * 1440})`} opacity={0.4 + pump * 0.6}>
        <circle r={20} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="10 6" />
        <path d="M-6,-4 L6,0 L-6,4 Z" fill={ACCENT} />
      </g>
      <T x={690} y={446} anchor="middle" on={pump > 0.3}>Na⁺/K⁺ ATPase · 3 out, 2 in</T>
    </svg>
  );
};

/* ─── 3. Chemical synapse ───────────────────────────── */

const VESICLES: { from: Pt; to: Pt }[] = [
  { from: [300, 150], to: [290, 216] }, { from: [350, 176], to: [345, 216] }, { from: [400, 138], to: [400, 216] },
  { from: [452, 178], to: [455, 216] }, { from: [500, 150], to: [510, 216] }, { from: [400, 192], to: [372, 216] },
];
const RECEPTORS = [270, 330, 390, 450, 510];

export const Synapse: React.FC<AnimProps> = ({ u }) => {
  const ap = ease(0, 0.12, u) * (1 - ease(0.3, 0.45, u));
  const bound = ease(0.56, 0.62, u) * (1 - ease(0.78, 0.86, u));
  const epsp = (u < 0.6 ? 0 : ease(0.6, 0.7, u) * (1 - ease(0.72, 0.95, u)));
  const epspTrace: Pt[] = Array.from({ length: 61 }, (_, i) => {
    const w = i / 60;
    const v = w < 0.6 ? 0 : ease(0.6, 0.7, w) * (1 - ease(0.72, 0.95, w));
    return [600 + w * 170, 440 - v * 50] as Pt;
  }).filter(([x]) => x <= 600 + u * 170);
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs>
        <Glow id="sy-glow" />
        <linearGradient id="sy-ap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SOFT} stopOpacity={0.9} /><stop offset="1" stopColor={SOFT} stopOpacity={0} /></linearGradient>
      </defs>
      <path d="M370,0 L430,0 L430,60 C550,80 600,140 595,230 L205,230 C200,140 250,80 370,60 Z" fill="rgba(125,162,255,.08)" stroke={ACCENT} strokeWidth={2} />
      <rect x={370} y={0} width={60} height={70 + ap * 120} fill="url(#sy-ap)" opacity={ap} />
      <path d="M370,0 L430,0 L430,60 C550,80 600,140 595,230 L205,230 C200,140 250,80 370,60 Z" fill="none" stroke={SOFT} strokeWidth={4} opacity={ap * 0.7} filter="url(#sy-glow)" />
      {[240, 560].map((x) => <rect key={x} x={x - 9} y={222} width={18} height={16} rx={3} fill={u > 0.12 && u < 0.3 ? CA : 'rgba(232,128,111,.4)'} />)}
      {Array.from({ length: 10 }, (_, i) => {
        const side = i % 2 ? 560 : 240;
        const p = ease(0.12 + i * 0.01, 0.26 + i * 0.01, u);
        const fade = 1 - ease(0.42, 0.5, u);
        if (p <= 0 && u < 0.12) return <circle key={i} cx={side + ((i * 13) % 50) - 25} cy={250 + ((i * 7) % 12)} r={4} fill={CA} opacity={0.75} />;
        return <circle key={i} cx={lerp(side + ((i * 13) % 50) - 25, side + (side < 400 ? 40 : -40) + (i % 3) * 10, p)} cy={lerp(250, 200 - (i % 4) * 8, p)} r={4} fill={CA} opacity={fade} filter="url(#sy-glow)" />;
      })}
      {VESICLES.map((v, i) => {
        const move = ease(0.24 + i * 0.02, 0.4 + i * 0.02, u);
        const fuse = ease(0.4 + i * 0.02, 0.48 + i * 0.02, u);
        const back = ease(0.92, 1, u);
        const [x, y] = [lerp(v.from[0], v.to[0], move * (1 - back)), lerp(v.from[1], v.to[1], move * (1 - back))];
        return (
          <g key={i} opacity={1 - fuse + back}>
            <circle cx={x} cy={y} r={15 * (1 - fuse * 0.6)} fill="rgba(239,230,209,.12)" stroke={IVORY} strokeOpacity={0.7} />
            {[[-5, -4], [5, -3], [0, 5], [-4, 4]].map(([dx, dy], k) => <circle key={k} cx={x + dx} cy={y + dy} r={2.6} fill={SOFT} />)}
          </g>
        );
      })}
      {VESICLES.flatMap((v, i) => [0, 1, 2].map((k) => {
        const release = ease(0.46 + i * 0.01, 0.58 + i * 0.01, u);
        const reuptake = ease(0.8, 0.92, u);
        if (release <= 0 || reuptake >= 1) return null;
        const target = RECEPTORS[(i + k) % RECEPTORS.length] + (k - 1) * 6;
        const x = lerp(v.to[0] + (k - 1) * 6, target, release);
        const y = lerp(234, 266, release) - Math.sin(release * Math.PI) * 6 - reuptake * 28;
        return <circle key={`${i}-${k}`} cx={x} cy={y} r={3} fill={SOFT} opacity={1 - reuptake} filter="url(#sy-glow)" />;
      }))}
      <path d="M150,268 L570,268 L570,470 L150,470 Z" fill="rgba(239,230,209,.05)" stroke={ACCENT} strokeWidth={2} />
      {RECEPTORS.map((x) => (
        <g key={x}>
          <path d={`M${x - 11},264 L${x - 11},282 L${x + 11},282 L${x + 11},264`} fill="none" stroke={bound > 0.1 ? SOFT : ACCENT} strokeWidth={3} filter={bound > 0.1 ? 'url(#sy-glow)' : undefined} />
          {[0, 1].map((k) => {
            const p = ease(0.6 + k * 0.04, 0.76 + k * 0.04, u);
            return p > 0 && p < 1 ? <circle key={k} cx={x + (k ? 4 : -4)} cy={lerp(272, 340, p)} r={3.5} fill={SOFT} opacity={0.9} /> : null;
          })}
        </g>
      ))}
      <rect x={590} y={380} width={194} height={74} rx={8} fill="rgba(8,13,24,.6)" stroke="rgba(125,162,255,.3)" />
      <line x1={600} x2={770} y1={440} y2={440} stroke="rgba(255,255,255,.12)" />
      {epspTrace.length > 1 && <path d={toPath(epspTrace)} stroke={SOFT} strokeWidth={2.5} fill="none" />}
      <T x={604} y={398} on={epsp > 0.2}>EPSP</T>
      <T x={36} y={110}>Presynaptic terminal</T>
      <T x={226} y={256} anchor="end" on={u > 0.12 && u < 0.3}>Ca²⁺ channel</T>
      <T x={606} y={150} on={u > 0.24 && u < 0.5}>Synaptic vesicles</T>
      <T x={604} y={252} on={u > 0.46 && u < 0.62}>Synaptic cleft</T>
      <T x={584} y={300} on={bound > 0.3}>Ligand-gated receptors</T>
      <T x={170} y={456}>Postsynaptic neuron</T>
      {u > 0.78 && u < 0.94 && <T x={400} y={252} anchor="middle" on>Enzyme breakdown · reuptake</T>}
    </svg>
  );
};

/* ─── 4. Stretch reflex (knee jerk) ─────────────────── */

const AFFERENT: Pt[] = [...bezier([252, 208], [330, 120], [430, 50], [520, 70]), ...bezier([520, 70], [560, 78], [582, 100], [598, 158]).slice(1)];
const EFFERENT: Pt[] = bezier([612, 178], [560, 250], [400, 268], [258, 222]);
const INHIBIT: Pt[] = bezier([640, 178], [570, 320], [380, 340], [222, 250]);

export const ReflexArc: React.FC<AnimProps> = ({ u }) => {
  const tap = ease(0, 0.05, u) * (1 - ease(0.06, 0.14, u));
  const aff = ramp(0.08, 0.36, u);
  const syn = ease(0.36, 0.4, u) * (1 - ease(0.44, 0.5, u));
  const eff = ramp(0.44, 0.7, u);
  const inh = ramp(0.44, 0.68, u);
  const contract = ease(0.68, 0.74, u) * (1 - ease(0.86, 0.98, u));
  const kick = ease(0.7, 0.8, u) * (1 - ease(0.85, 1, u));
  const angle = (-38 * kick * Math.PI) / 180;
  const ankle: Pt = [290 - Math.sin(angle) * 140, 290 + Math.cos(angle) * 140];
  const foot: Pt = [ankle[0] + Math.cos(angle) * 44, ankle[1] + Math.sin(angle) * 44];
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs><Glow id="rx-glow" /></defs>
      <ellipse cx={620} cy={140} rx={112} ry={82} fill="rgba(239,230,209,.05)" stroke="rgba(125,162,255,.45)" />
      <g fill="rgba(125,162,255,.22)" stroke={ACCENT} strokeOpacity={0.6}>
        <path d="M620,128 C600,95 575,80 560,95 C552,105 570,125 585,135 C565,150 550,175 562,190 C578,200 600,170 620,152 Z" />
        <path d="M620,128 C600,95 575,80 560,95 C552,105 570,125 585,135 C565,150 550,175 562,190 C578,200 600,170 620,152 Z" transform="translate(1240,0) scale(-1,1)" />
      </g>
      <circle cx={620} cy={140} r={3} fill={IVORY} />
      <ellipse cx={520} cy={70} rx={18} ry={12} fill={aff > 0.6 ? SOFT : 'rgba(125,162,255,.35)'} opacity={0.8} />
      <circle cx={608} cy={176} r={8} fill={syn > 0.1 ? SOFT : ACCENT} filter={syn > 0.1 ? 'url(#rx-glow)' : undefined} />
      <circle cx={642} cy={172} r={6} fill={K} opacity={0.85} />

      <path d={toPath(AFFERENT)} stroke={DIM} strokeWidth={2.5} fill="none" />
      <path d={toPath(EFFERENT)} stroke={DIM} strokeWidth={2.5} fill="none" />
      <path d={toPath(INHIBIT)} stroke="rgba(143,199,216,.35)" strokeWidth={2} strokeDasharray="6 6" fill="none" />
      {aff > 0 && <path d={toPath(slice(AFFERENT, aff))} stroke={SOFT} strokeWidth={3} fill="none" opacity={1 - ease(0.6, 0.8, u)} />}
      {aff > 0 && aff < 1 && <Pulse at={along(AFFERENT, aff)} filter="rx-glow" />}
      {eff > 0 && <path d={toPath(slice(EFFERENT, eff))} stroke={SOFT} strokeWidth={3} fill="none" opacity={1 - ease(0.85, 0.98, u)} />}
      {eff > 0 && eff < 1 && <Pulse at={along(EFFERENT, eff)} filter="rx-glow" />}
      {inh > 0 && inh < 1 && <Pulse at={along(INHIBIT, inh)} r={6} color={K} filter="rx-glow" />}

      {/* Leg */}
      <line x1={170} y1={170} x2={290} y2={290} stroke={IVORY} strokeOpacity={0.85} strokeWidth={30} strokeLinecap="round" />
      <ellipse cx={243} cy={217} rx={lerp(62, 54, contract)} ry={lerp(13, 16, contract)} transform="rotate(45 243 217)" fill={contract > 0.1 ? SOFT : 'rgba(125,162,255,.55)'} filter={contract > 0.1 ? 'url(#rx-glow)' : undefined} />
      <ellipse cx={217} cy={243} rx={58} ry={11} transform="rotate(45 217 243)" fill="rgba(143,199,216,.45)" opacity={inh > 0.95 && u < 0.9 ? 0.4 : 0.8} />
      <path d="M244,206 l6,-6 l4,8 l6,-8 l4,8" stroke={CA} strokeWidth={2} fill="none" />
      <line x1={290} y1={290} x2={ankle[0]} y2={ankle[1]} stroke={IVORY} strokeOpacity={0.85} strokeWidth={24} strokeLinecap="round" />
      <line x1={ankle[0]} y1={ankle[1]} x2={foot[0]} y2={foot[1]} stroke={IVORY} strokeOpacity={0.85} strokeWidth={14} strokeLinecap="round" />
      <circle cx={304} cy={292} r={9} fill="rgba(125,162,255,.6)" />
      <g transform={`translate(392 338) rotate(${-28 * (1 - tap)})`}>
        <line x1={0} y1={0} x2={-66} y2={-38} stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
        <rect x={-80} y={-50} width={16} height={30} rx={4} transform="rotate(-30 -72 -35)" fill={SOFT} />
      </g>
      {tap > 0.4 && <circle cx={306} cy={292} r={16} fill="none" stroke={SOFT} strokeWidth={2} opacity={tap} />}

      <T x={330} y={330} on={tap > 0.2}>Patellar tendon tap</T>
      <T x={300} y={196} on={aff > 0 && aff < 0.4}>Muscle spindle · Ia afferent</T>
      <T x={520} y={44} anchor="middle" on={aff > 0.5 && aff < 1}>Dorsal root ganglion</T>
      <T x={792} y={214} anchor="end" on={syn > 0.2}>α-motor neuron · one synapse</T>
      <T x={360} y={360} on={inh > 0 && inh < 1}>Inhibitory interneuron → hamstrings relax</T>
      <T x={128} y={150} on={contract > 0.3}>Quadriceps contracts</T>
      <T x={620} y={250} anchor="middle">Spinal cord · L3–L4</T>
    </svg>
  );
};

/* ─── 5. Sliding filament ───────────────────────────── */

const ACTIN_ROWS = [130, 190, 250, 310, 370];
const MYOSIN_ROWS = [160, 220, 280, 340];
const SPARKS: Pt[] = Array.from({ length: 16 }, (_, i) => [180 + ((i * 97) % 440), 120 + ((i * 53) % 260)]);

export const SlidingFilament: React.FC<AnimProps> = ({ u }) => {
  const c = ease(0.12, 0.45, u) * (1 - ease(0.65, 0.95, u));
  const xL = lerp(110, 190, c);
  const xR = lerp(690, 610, c);
  const cycling = ease(0.1, 0.15, u) * (1 - ease(0.45, 0.52, u));
  const calcium = ease(0.06, 0.12, u) * (1 - ease(0.5, 0.62, u));
  const hLeft = xL + 230;
  const hRight = xR - 230;
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs><Glow id="sf-glow" blur={3} /></defs>
      {ACTIN_ROWS.map((y) => (
        <g key={y}>
          {Array.from({ length: 24 }, (_, i) => <circle key={`l${i}`} cx={xL + i * 10} cy={y + (i % 2 ? 2 : -2)} r={3.8} fill="#93a8ff" opacity={0.85} />)}
          {Array.from({ length: 24 }, (_, i) => <circle key={`r${i}`} cx={xR - i * 10} cy={y + (i % 2 ? 2 : -2)} r={3.8} fill="#93a8ff" opacity={0.85} />)}
        </g>
      ))}
      {MYOSIN_ROWS.map((y, row) => (
        <g key={y}>
          <line x1={260} x2={540} y1={y} y2={y} stroke="#d9cfb5" strokeWidth={11} strokeLinecap="round" />
          {Array.from({ length: 11 }, (_, i) => 270 + i * 20).filter((x) => Math.abs(x - 400) > 24).flatMap((x, i) => [-1, 1].map((side) => {
            // Heads lean towards their Z line; the power stroke swings them towards the M line.
            const towardsZ = x < 400 ? -1 : 1;
            const tilt = 0.65 - cycling * 0.5 * (1 + Math.sin(u * 80 + i * 0.9 + row)) / 2 * 1.6;
            const by = y + side * 6;
            const tx = x + towardsZ * Math.sin(tilt) * 15;
            const ty = by + side * Math.cos(tilt) * 15;
            return <line key={`${x}${side}`} x1={x} y1={by} x2={tx} y2={ty} stroke={cycling > 0.1 ? SOFT : '#cfc6b3'} strokeWidth={3.5} strokeLinecap="round" />;
          }))}
        </g>
      ))}
      {[xL, xR].map((x, i) => (
        <path key={i} d={`M${x},110 l-8,20 l16,20 l-16,20 l16,20 l-16,20 l16,20 l-16,20 l16,20 l-16,20 l16,20 l-16,20 l16,20 l-8,20`} stroke={ACCENT} strokeWidth={3} fill="none" />
      ))}
      <line x1={400} x2={400} y1={120} y2={380} stroke={IVORY} strokeOpacity={0.35} strokeDasharray="4 6" />
      {SPARKS.map(([x, y], i) => <circle key={i} cx={x} cy={y + Math.sin(u * 30 + i) * 4} r={3.4} fill={CA} opacity={calcium * 0.9} filter="url(#sf-glow)" />)}

      {/* Bands */}
      <line x1={260} x2={540} y1={72} y2={72} stroke={SOFT} strokeWidth={2} />
      <line x1={260} x2={260} y1={66} y2={78} stroke={SOFT} strokeWidth={2} /><line x1={540} x2={540} y1={66} y2={78} stroke={SOFT} strokeWidth={2} />
      <T x={400} y={62} anchor="middle" on>A band — stays constant</T>
      {hRight > hLeft + 2 && (
        <>
          <line x1={hLeft} x2={hRight} y1={96} y2={96} stroke={K} strokeWidth={2} />
          <T x={400} y={90} anchor="middle">H zone</T>
        </>
      )}
      <line x1={xL} x2={260} y1={400} y2={400} stroke={K} strokeWidth={2} />
      <line x1={540} x2={xR} y1={400} y2={400} stroke={K} strokeWidth={2} />
      <T x={(xL + 260) / 2} y={418} anchor="middle">I band</T>
      <T x={(540 + xR) / 2} y={418} anchor="middle">I band</T>
      <line x1={xL} x2={xR} y1={440} y2={440} stroke="rgba(239,230,209,.4)" />
      <T x={400} y={458} anchor="middle" on={c > 0.5}>{c > 0.5 ? 'Sarcomere shortens (Z lines pulled together)' : 'Sarcomere (Z line to Z line)'}</T>
      <T x={xL - 10} y={104} anchor="end">Z</T>
      <T x={xR + 10} y={104}>Z</T>
      <T x={406} y={392}>M line</T>
      <T x={16} y={28} on={calcium > 0.3}>Ca²⁺ → troponin C</T>
      <T x={16} y={46} on={cycling > 0.3}>Cross-bridge cycling</T>
    </svg>
  );
};

/* ─── 6. Cardiac conduction + ECG ───────────────────── */

const HEART = 'M400,330 C330,290 230,230 235,150 C240,90 300,60 345,85 C370,98 390,118 400,135 C410,118 430,98 455,85 C500,60 560,90 565,150 C570,230 470,290 400,330 Z';
const INTERNODAL: Pt[] = bezier([305, 110], [325, 140], [355, 175], [385, 198]);
const HIS: Pt[] = [[385, 198], [398, 232]];
const RIGHT_BRANCH: Pt[] = [[398, 232], [372, 278], [345, 302], [300, 262], [276, 196]];
const LEFT_BRANCH: Pt[] = [[402, 232], [440, 276], [472, 298], [520, 246], [540, 182]];
const gauss = (u: number, mu: number, s: number) => Math.exp(-((u - mu) ** 2) / (2 * s * s));
const ecg = (u: number) => -14 * gauss(u, 0.075, 0.022) + 6 * gauss(u, 0.272, 0.006) - 62 * gauss(u, 0.29, 0.007) + 16 * gauss(u, 0.308, 0.007) - 20 * gauss(u, 0.56, 0.04);
const ECG_TRACE: Pt[] = Array.from({ length: 401 }, (_, i) => [60 + (i / 400) * 680, 425 + ecg(i / 400)]);

export const CardiacConduction: React.FC<AnimProps> = ({ u }) => {
  const sa = ease(0, 0.03, u) * (1 - ease(0.06, 0.14, u));
  const atria = ease(0.01, 0.12, u) * (1 - ease(0.26, 0.36, u));
  const internodal = ramp(0, 0.12, u);
  const av = ease(0.11, 0.14, u) * (1 - ease(0.24, 0.28, u));
  const his = ramp(0.26, 0.29, u);
  const branches = ramp(0.29, 0.36, u);
  const ventricles = ease(0.3, 0.38, u) * (1 - ease(0.48, 0.66, u));
  const squeeze = 1 - 0.035 * ease(0.34, 0.42, u) * (1 - ease(0.5, 0.66, u));
  const drawn = ECG_TRACE.filter(([x]) => x <= 60 + u * 680);
  return (
    <svg viewBox="0 0 800 470" className={styles.svg}>
      <defs>
        <Glow id="cc-glow" />
        <clipPath id="cc-heart"><path d={HEART} /></clipPath>
        <radialGradient id="cc-wave"><stop offset="0" stopColor={SOFT} stopOpacity={0.55} /><stop offset="1" stopColor={SOFT} stopOpacity={0} /></radialGradient>
      </defs>
      <g transform={`translate(400 230) scale(${squeeze}) translate(-400 -230)`}>
        <path d={HEART} fill="rgba(125,162,255,.08)" stroke={ACCENT} strokeWidth={2} />
        <g clipPath="url(#cc-heart)">
          <circle cx={305} cy={110} r={40 + atria * 220} fill="url(#cc-wave)" opacity={atria} />
          <rect x={200} y={204} width={400} height={140} fill={SOFT} opacity={ventricles * 0.28} />
        </g>
        <path d="M245,202 C300,212 350,206 400,204 C450,206 500,212 555,202" stroke="rgba(239,230,209,.35)" strokeDasharray="5 6" fill="none" />
        <line x1={400} y1={210} x2={400} y2={322} stroke="rgba(239,230,209,.25)" />
        <path d={toPath(INTERNODAL)} stroke={DIM} strokeWidth={2} fill="none" />
        {[HIS, RIGHT_BRANCH, LEFT_BRANCH].map((p, i) => <path key={i} d={toPath(p)} stroke={DIM} strokeWidth={3} fill="none" />)}
        {internodal > 0 && internodal < 1 && <Pulse at={along(INTERNODAL, internodal)} r={5} filter="cc-glow" />}
        {his > 0 && <path d={toPath(slice(HIS, his))} stroke={SOFT} strokeWidth={4} fill="none" opacity={1 - ease(0.5, 0.66, u)} />}
        {branches > 0 && [RIGHT_BRANCH, LEFT_BRANCH].map((p, i) => (
          <g key={i}>
            <path d={toPath(slice(p, branches))} stroke={SOFT} strokeWidth={4} fill="none" opacity={1 - ease(0.5, 0.66, u)} filter="url(#cc-glow)" />
            {branches < 1 && <Pulse at={along(p, branches)} r={5} filter="cc-glow" />}
          </g>
        ))}
        <circle cx={305} cy={110} r={9} fill={sa > 0.05 ? '#fff4cc' : ACCENT} filter={sa > 0.05 ? 'url(#cc-glow)' : undefined} />
        <circle cx={385} cy={198} r={8 + av * 3 * Math.abs(Math.sin(u * 60))} fill={av > 0.05 ? SOFT : ACCENT} filter={av > 0.05 ? 'url(#cc-glow)' : undefined} />
      </g>
      <T x={292} y={104} anchor="end" on={sa > 0.2 || atria > 0.4}>SA node · pacemaker</T>
      <T x={372} y={226} anchor="end" on={av > 0.2}>AV node · delay ≈0.1 s</T>
      <T x={412} y={240} on={his > 0 && his < 1}>Bundle of His</T>
      <T x={556} y={180} on={branches > 0.4}>Purkinje fibres</T>
      <T x={484} y={318} on={branches > 0 && branches < 1}>Bundle branches</T>

      <rect x={50} y={352} width={700} height={108} rx={10} fill="rgba(8,13,24,.6)" stroke="rgba(125,162,255,.3)" />
      <path d={toPath(ECG_TRACE)} stroke={DIM} strokeWidth={1.5} fill="none" />
      {drawn.length > 1 && <path d={toPath(drawn)} stroke={SOFT} strokeWidth={2.5} fill="none" filter="url(#cc-glow)" />}
      <line x1={60 + u * 680} x2={60 + u * 680} y1={360} y2={452} stroke={SOFT} strokeOpacity={0.4} />
      <T x={60 + 0.075 * 680} y={398} anchor="middle" on={u > 0.02 && u < 0.14}>P</T>
      <T x={60 + 0.29 * 680 + 14} y={376} on={u > 0.26 && u < 0.34}>QRS</T>
      <T x={60 + 0.56 * 680} y={392} anchor="middle" on={u > 0.48 && u < 0.66}>T</T>
      <line x1={60 + 0.04 * 680} x2={60 + 0.27 * 680} y1={448} y2={448} stroke={K} strokeWidth={1.5} />
      <T x={60 + 0.155 * 680} y={444} anchor="middle" on={u > 0.12 && u < 0.27}>PR 0.12–0.20 s</T>
    </svg>
  );
};
