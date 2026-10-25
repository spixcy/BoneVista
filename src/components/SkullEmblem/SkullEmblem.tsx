import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styles from './SkullEmblem.module.css';

const UPPER_TEETH = [150, 163, 176, 188, 200, 212, 224, 237, 250];
const LOWER_TEETH = [156, 168, 180, 191, 200, 209, 220, 232, 244];
const SUTURE = 'M118,96 L126,104 L134,94 L143,104 L152,92 L161,102 L170,90 L179,100 L188,88 L196,98 L204,98 L212,88 L221,100 L230,90 L239,102 L248,92 L257,104 L266,94 L274,104 L282,96';
const PARTICLES = [
  { cx: 42, cy: 120, r: 1.6, d: 0 }, { cx: 362, cy: 90, r: 1.2, d: 1.2 }, { cx: 378, cy: 300, r: 1.8, d: 0.6 },
  { cx: 24, cy: 330, r: 1.1, d: 2.1 }, { cx: 330, cy: 452, r: 1.4, d: 1.6 }, { cx: 70, cy: 456, r: 1.2, d: 0.9 },
  { cx: 200, cy: 12, r: 1.3, d: 2.6 }, { cx: 386, cy: 196, r: 1, d: 3.1 },
];

type Props = { className?: string };

/** Animated gold line-art skull used as the landing page hero emblem. */
const SkullEmblem: React.FC<Props> = ({ className }) => {
  
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-1, 1], [-14, 14]);
  const rotateX = useTransform(sy, [-1, 1], [10, -10]);
  const glowX = useTransform(sx, [-1, 1], ['35%', '65%']);
  const glowY = useTransform(sy, [-1, 1], ['35%', '60%']);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        px.set((event.clientX / window.innerWidth) * 2 - 1);
        py.set((event.clientY / window.innerHeight) * 2 - 1);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); cancelAnimationFrame(frame); };
  }, [px, py]);

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} aria-hidden="true">
      <motion.div className={styles.halo} style={{ left: glowX, top: glowY }} />
      <motion.div className={styles.tilt} style={{ rotateX, rotateY }}>
        <svg className={styles.svg} viewBox="0 0 400 510" fill="none">
          <defs>
            <linearGradient id="bvGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="38%" stopColor="#e3c25a" />
              <stop offset="68%" stopColor="#b08a2e" />
              <stop offset="100%" stopColor="#f3dc8f" />
            </linearGradient>
            <radialGradient id="bvEye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe9a6" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#d4af37" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bvScan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
              <stop offset="50%" stopColor="#f6dd8a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
            <clipPath id="bvSkullClip">
              <path d="M200,40 C285,40 345,100 345,190 C345,235 336,262 322,282 C331,302 328,324 312,338 C300,348 296,360 294,380 C296,412 288,440 264,456 C242,470 220,474 200,474 C180,474 158,470 136,456 C112,440 104,412 106,380 C104,360 100,348 88,338 C72,324 69,302 78,282 C64,262 55,235 55,190 C55,100 115,40 200,40 Z" />
            </clipPath>
          </defs>

          {/* Orbit rings */}
          <g className={styles.orbit}>
            <ellipse cx="200" cy="250" rx="192" ry="70" stroke="url(#bvGold)" strokeOpacity="0.32" strokeWidth="0.8" strokeDasharray="2 7" />
          </g>
          <g className={styles.orbitReverse}>
            <ellipse cx="200" cy="250" rx="70" ry="214" stroke="url(#bvGold)" strokeOpacity="0.18" strokeWidth="0.7" strokeDasharray="1 9" />
          </g>

          {/* Soft fill so the skull reads as a solid form */}
          <path className={styles.fill} d="M200,40 C285,40 345,100 345,190 C345,235 336,262 322,282 C331,302 328,324 312,338 C300,348 292,356 288,372 L286,394 C270,402 232,406 200,406 C168,406 130,402 114,394 L112,372 C108,356 100,348 88,338 C72,324 69,302 78,282 C64,262 55,235 55,190 C55,100 115,40 200,40 Z" />

          <g className={styles.lines} stroke="url(#bvGold)" strokeLinecap="round" strokeLinejoin="round">
            {/* Cranium and upper face */}
            <path pathLength={1} strokeWidth="2.2" d="M200,40 C285,40 345,100 345,190 C345,235 336,262 322,282 C331,302 328,324 312,338 C300,348 292,356 288,372 L286,394 C270,402 232,406 200,406 C168,406 130,402 114,394 L112,372 C108,356 100,348 88,338 C72,324 69,302 78,282 C64,262 55,235 55,190 C55,100 115,40 200,40 Z" />
            {/* Mandible */}
            <path pathLength={1} strokeWidth="2" d="M112,372 C104,412 112,440 136,456 C158,470 180,474 200,474 C220,474 242,470 264,456 C288,440 296,412 288,372" />
            <path pathLength={1} strokeWidth="1.2" d="M134,410 C150,446 176,458 200,458 C224,458 250,446 266,410" style={{ animationDelay: '.5s' }} />
            {/* Orbits */}
            <path pathLength={1} strokeWidth="2" d="M118,212 C120,186 150,176 172,184 C186,189 190,206 186,226 C182,248 166,262 146,260 C126,258 116,238 118,212 Z" style={{ animationDelay: '.25s' }} />
            <path pathLength={1} strokeWidth="2" d="M282,212 C280,186 250,176 228,184 C214,189 210,206 214,226 C218,248 234,262 254,260 C274,258 284,238 282,212 Z" style={{ animationDelay: '.25s' }} />
            {/* Brow ridge */}
            <path pathLength={1} strokeWidth="1.3" d="M104,196 C134,164 176,166 200,190 C224,166 266,164 296,196" style={{ animationDelay: '.4s' }} />
            {/* Nasal aperture */}
            <path pathLength={1} strokeWidth="1.8" d="M200,268 C192,284 182,306 186,322 C189,332 198,330 200,322 C202,330 211,332 214,322 C218,306 208,284 200,268 Z" style={{ animationDelay: '.35s' }} />
            <path pathLength={1} strokeWidth="1" d="M200,268 L200,322" style={{ animationDelay: '.6s' }} />
            {/* Zygomatic arches */}
            <path pathLength={1} strokeWidth="1.2" d="M84,300 C108,288 132,290 150,276" style={{ animationDelay: '.45s' }} />
            <path pathLength={1} strokeWidth="1.2" d="M316,300 C292,288 268,290 250,276" style={{ animationDelay: '.45s' }} />
            <path pathLength={1} strokeWidth="1" d="M118,330 C138,334 152,344 160,362" style={{ animationDelay: '.55s' }} />
            <path pathLength={1} strokeWidth="1" d="M282,330 C262,334 248,344 240,362" style={{ animationDelay: '.55s' }} />
            {/* Temporal lines */}
            <path pathLength={1} strokeWidth="1" d="M74,196 C80,144 118,104 164,90" style={{ animationDelay: '.5s' }} />
            <path pathLength={1} strokeWidth="1" d="M326,196 C320,144 282,104 236,90" style={{ animationDelay: '.5s' }} />
            {/* Sutures */}
            <path pathLength={1} strokeWidth="0.9" strokeOpacity="0.7" d={SUTURE} style={{ animationDelay: '.7s' }} />
            <path pathLength={1} strokeWidth="0.9" strokeOpacity="0.55" d="M200,42 L204,52 L197,62 L204,72 L197,82 L201,90" style={{ animationDelay: '.75s' }} />
            {/* Teeth */}
            <path pathLength={1} strokeWidth="1.4" d="M138,380 C162,388 238,388 262,380" style={{ animationDelay: '.6s' }} />
            <path pathLength={1} strokeWidth="1.4" d="M140,416 C164,424 236,424 260,416" style={{ animationDelay: '.65s' }} />
            {UPPER_TEETH.map((x) => <path key={`u${x}`} pathLength={1} strokeWidth="1" d={`M${x},${384 + Math.abs(x - 200) * 0.03} L${x},404`} style={{ animationDelay: '.8s' }} />)}
            {LOWER_TEETH.map((x) => <path key={`l${x}`} pathLength={1} strokeWidth="1" d={`M${x},406 L${x},${420 - Math.abs(x - 200) * 0.03}`} style={{ animationDelay: '.85s' }} />)}
          </g>

          {/* Eye glow */}
          <ellipse className={styles.eye} cx="152" cy="222" rx="30" ry="32" fill="url(#bvEye)" />
          <ellipse className={styles.eye} cx="248" cy="222" rx="30" ry="32" fill="url(#bvEye)" style={{ animationDelay: '.4s' }} />
          <circle className={styles.pupil} cx="152" cy="222" r="3.2" fill="#fff4cc" />
          <circle className={styles.pupil} cx="248" cy="222" r="3.2" fill="#fff4cc" />

          {/* Scanning beam clipped to the skull silhouette */}
          <g clipPath="url(#bvSkullClip)">
            <rect className={styles.scan} x="40" y="-40" width="320" height="56" fill="url(#bvScan)" />
          </g>

          {/* Measurement ticks */}
          <g className={styles.ticks} stroke="#d4af37" strokeOpacity="0.5" strokeWidth="0.8">
            <path d="M14,40 L14,474 M10,40 L18,40 M10,474 L18,474 M10,257 L18,257" />
            <path d="M55,494 L345,494 M55,490 L55,498 M345,490 L345,498 M200,490 L200,498" />
          </g>
          <text className={styles.tickLabel} x="22" y="261">H 23.4 cm</text>
          <text className={styles.tickLabel} x="206" y="490" textAnchor="start">W 14.6 cm</text>

          {PARTICLES.map((p) => <circle key={`${p.cx}-${p.cy}`} className={styles.particle} cx={p.cx} cy={p.cy} r={p.r} fill="#f1d78a" style={{ animationDelay: `${p.d}s` }} />)}
        </svg>
      </motion.div>
      <div className={styles.plinth} />
    </div>
  );
};

export default SkullEmblem;
