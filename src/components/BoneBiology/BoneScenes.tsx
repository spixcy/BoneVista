import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import type { TopicId } from './content';
import styles from './BoneBiology.module.css';
import { ARTERY, BONE, BONE_LIGHT, CARTILAGE, GOLD, Label, LabelContext, LabelProjector, OSTEOBLAST, OSTEOCLAST, OSTEOID, RED_MARROW, Sway, VEIN, YELLOW_MARROW, rng, smooth, type LabelEntry, type Vec3 } from './sceneKit';

/* ─── Long bone cut-away ─────────────────────────────── */

const PROFILE: [number, number][] = [
  [0, -2.25], [0.45, -2.22], [0.62, -2.1], [0.68, -1.9], [0.62, -1.65], [0.42, -1.35], [0.3, -1.0], [0.28, -0.5], [0.27, 0],
  [0.28, 0.5], [0.3, 1.0], [0.42, 1.35], [0.62, 1.65], [0.68, 1.9], [0.62, 2.1], [0.45, 2.22], [0, 2.25],
];
const rOut = (y: number) => {
  for (let i = 1; i < PROFILE.length; i++) {
    const [r0, y0] = PROFILE[i - 1];
    const [r1, y1] = PROFILE[i];
    if (y >= y0 && y <= y1) return r0 + ((y - y0) / (y1 - y0 || 1)) * (r1 - r0);
  }
  return 0;
};
const cortex = (y: number) => 0.1 - 0.065 * smooth(1.0, 1.4, Math.abs(y));
const R_MAX = 0.72;
const Y_SPAN = 2.3;

function makeSectionTexture() {
  const W = 512;
  const H = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const px = (r: number, y: number): [number, number] => [(r / R_MAX) * W, ((Y_SPAN - y) / (2 * Y_SPAN)) * H];
  const ys = Array.from({ length: 241 }, (_, i) => -2.25 + (i / 240) * 4.5);
  const outline = () => {
    ctx.beginPath();
    ctx.moveTo(...px(0, -2.25));
    ys.forEach((y) => ctx.lineTo(...px(rOut(y), y)));
    ctx.lineTo(...px(0, 2.25));
    ctx.closePath();
  };
  // Red marrow base, then trabeculae.
  outline();
  ctx.fillStyle = RED_MARROW;
  ctx.fill();
  ctx.save();
  outline();
  ctx.clip();
  const rand = rng(7);
  ctx.strokeStyle = '#eadfc6';
  ctx.lineCap = 'round';
  for (let i = 0; i < 1400; i++) {
    const y = (rand() < 0.5 ? -1 : 1) * (0.9 + rand() * 1.4);
    const r = rand() * rOut(y);
    const [x0, y0] = px(r, y);
    const angle = rand() * Math.PI;
    const len = 10 + rand() * 18;
    ctx.lineWidth = 3 + rand() * 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + Math.cos(angle) * len, y0 + Math.sin(angle) * len);
    ctx.stroke();
  }
  ctx.restore();
  // Medullary cavity with yellow marrow.
  ctx.beginPath();
  const cavity = ys.filter((y) => Math.abs(y) <= 1.15);
  ctx.moveTo(...px(0, cavity[0]));
  cavity.forEach((y) => ctx.lineTo(...px(Math.max(0, rOut(y) - cortex(y)) * smooth(1.15, 0.95, Math.abs(y)), y)));
  ctx.lineTo(...px(0, cavity[cavity.length - 1]));
  ctx.closePath();
  ctx.fillStyle = YELLOW_MARROW;
  ctx.fill();
  // Compact cortex band.
  ctx.beginPath();
  ys.forEach((y, i) => (i ? ctx.lineTo(...px(rOut(y), y)) : ctx.moveTo(...px(rOut(y), y))));
  [...ys].reverse().forEach((y) => ctx.lineTo(...px(Math.max(0, rOut(y) - cortex(y)), y)));
  ctx.closePath();
  ctx.fillStyle = BONE_LIGHT;
  ctx.fill();
  // Physis (top, child) and epiphyseal line (bottom, adult).
  const [, gTop] = px(0, 1.45);
  const [, gBottom] = px(0, 1.39);
  ctx.fillStyle = CARTILAGE;
  ctx.fillRect(0, gTop, px(rOut(1.42), 0)[0], gBottom - gTop);
  ctx.strokeStyle = '#c4b38a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, px(0, -1.42)[1]);
  ctx.lineTo(px(rOut(-1.42), 0)[0], px(0, -1.42)[1]);
  ctx.stroke();
  // Articular cartilage and periosteum along the outline.
  const strokeAlong = (from: number, to: number, color: string, width: number) => {
    ctx.beginPath();
    ys.filter((y) => y >= from && y <= to).forEach((y, i) => (i ? ctx.lineTo(...px(rOut(y) - 0.01, y)) : ctx.moveTo(...px(rOut(y) - 0.01, y))));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  strokeAlong(1.95, 2.25, CARTILAGE, 14);
  strokeAlong(-2.25, -1.95, CARTILAGE, 14);
  strokeAlong(-1.85, 1.85, GOLD, 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

const LongBone: React.FC = () => {
  const { lathe, caps, section, artery } = useMemo(() => {
    const dense: THREE.Vector2[] = [];
    for (let i = 0; i <= 120; i++) { const y = -2.25 + (i / 120) * 4.5; dense.push(new THREE.Vector2(rOut(y), y)); }
    const capPoints = (sign: number) => dense.filter((p) => p.y * sign >= 1.95).map((p) => new THREE.Vector2(p.x * 1.012, p.y + sign * 0.006));
    const foramen = new THREE.Vector3(Math.sin(0.15 * Math.PI) * 0.28, 0.2, Math.cos(0.15 * Math.PI) * 0.28);
    const curve = new THREE.CatmullRomCurve3([
      foramen.clone().multiplyScalar(2.3).add(new THREE.Vector3(0, 0.55, 0)),
      foramen.clone().multiplyScalar(1.5).add(new THREE.Vector3(0, 0.18, 0)),
      foramen.clone().multiplyScalar(0.9),
    ]);
    return {
      lathe: new THREE.LatheGeometry(dense, 96, 0, Math.PI * 1.5),
      caps: [new THREE.LatheGeometry(capPoints(1), 96, 0, Math.PI * 1.5), new THREE.LatheGeometry(capPoints(-1), 96, 0, Math.PI * 1.5)],
      section: makeSectionTexture(),
      artery: new THREE.TubeGeometry(curve, 24, 0.025, 8),
    };
  }, []);
  useEffect(() => () => { lathe.dispose(); caps.forEach((c) => c.dispose()); section.dispose(); artery.dispose(); }, [lathe, caps, section, artery]);

  return (
    <Sway amount={0.3}>
      <mesh geometry={lathe}><meshStandardMaterial color={BONE} roughness={0.75} side={THREE.DoubleSide} /></mesh>
      {caps.map((geometry, i) => <mesh key={i} geometry={geometry}><meshStandardMaterial color={CARTILAGE} roughness={0.3} side={THREE.DoubleSide} /></mesh>)}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, R_MAX / 2]}>
        <planeGeometry args={[R_MAX, Y_SPAN * 2]} />
        <meshStandardMaterial map={section} alphaTest={0.5} transparent side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
      <mesh scale={[-1, 1, 1]} position={[-R_MAX / 2, 0, 0]}>
        <planeGeometry args={[R_MAX, Y_SPAN * 2]} />
        <meshStandardMaterial map={section} alphaTest={0.5} transparent side={THREE.DoubleSide} roughness={0.85} />
      </mesh>
      <mesh geometry={artery}><meshStandardMaterial color={ARTERY} roughness={0.5} /></mesh>
      <Label position={[0, 2.2, 0.42]}>Articular cartilage</Label>
      <Label position={[0, 1.75, 0.36]}>Spongy bone + red marrow</Label>
      <Label position={[0, 1.42, 0.3]}>Physis (growth plate)</Label>
      <Label position={[0, 0.75, 0.24]}>Compact (cortical) bone</Label>
      <Label position={[0, -0.25, 0.08]}>Medullary cavity · yellow marrow</Label>
      <Label position={[Math.sin(0.15 * Math.PI) * 0.6, 0.62, Math.cos(0.15 * Math.PI) * 0.6]}>Nutrient artery</Label>
      <Label position={[Math.sin(0.06 * Math.PI) * 0.29, -0.85, Math.cos(0.06 * Math.PI) * 0.29]}>Periosteum</Label>
      <Label position={[0, -1.42, 0.3]}>Epiphyseal line (adult)</Label>
      <Label position={[-0.66, 1.9, 0]} left>Epiphysis</Label>
      <Label position={[-0.42, 1.2, 0]} left>Metaphysis</Label>
      <Label position={[-0.28, 0.1, 0]} left>Diaphysis</Label>
    </Sway>
  );
};

/* ─── Osteon ─────────────────────────────────────────── */

const LAMELLAE = [0.25, 0.42, 0.58, 0.74, 0.9, 1.06, 1.22];
const OSTEON_H = 2.6;

const Osteon: React.FC = () => {
  const { lacunae, canaliculi } = useMemo(() => {
    const rand = rng(11);
    const cells: { position: THREE.Vector3; scale: THREE.Vector3 }[] = [];
    const lines: number[] = [];
    for (const r of LAMELLAE.slice(1, -1)) {
      for (let k = 0; k < 5; k++) {
        const y = -1.05 + k * 0.52 + (rand() - 0.5) * 0.18;
        for (const plane of [0, 1]) {
          const pos = plane === 0 ? new THREE.Vector3(0, y, r) : new THREE.Vector3(-r, y, 0);
          const scale = plane === 0 ? new THREE.Vector3(0.06, 0.09, 0.03) : new THREE.Vector3(0.03, 0.09, 0.06);
          cells.push({ position: pos, scale });
          const radial = plane === 0 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(-1, 0, 0);
          for (const dir of [1, -1]) {
            const end = pos.clone().addScaledVector(radial, dir * 0.11).add(new THREE.Vector3(0, (rand() - 0.5) * 0.1, 0));
            lines.push(...pos.toArray(), ...end.toArray());
          }
        }
      }
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    return { lacunae: cells, canaliculi: lineGeometry };
  }, []);
  const lacunaRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = lacunaRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    lacunae.forEach((cell, i) => mesh.setMatrixAt(i, m.compose(cell.position, new THREE.Quaternion(), cell.scale)));
    mesh.instanceMatrix.needsUpdate = true;
  }, [lacunae]);
  useEffect(() => () => canaliculi.dispose(), [canaliculi]);

  const bands = LAMELLAE.slice(1).map((outer, i) => ({ inner: LAMELLAE[i], outer, color: i % 2 ? '#ddd0b2' : BONE_LIGHT }));
  return (
    <Sway amount={0.3}>
      {bands.map(({ inner, outer, color }) => (
        <group key={outer}>
          <mesh position={[0, OSTEON_H / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[inner, outer, 72, 1, -Math.PI / 2, Math.PI * 1.5]} />
            <meshStandardMaterial color={color} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, -Math.PI / 2, 0]} position={[0, 0, (inner + outer) / 2]}>
            <planeGeometry args={[outer - inner, OSTEON_H]} />
            <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-(inner + outer) / 2, 0, 0]}>
            <planeGeometry args={[outer - inner, OSTEON_H]} />
            <meshStandardMaterial color={color} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <mesh>
        <cylinderGeometry args={[1.22, 1.22, OSTEON_H, 72, 1, true, 0, Math.PI * 1.5]} />
        <meshStandardMaterial color={BONE} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, OSTEON_H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 72, 1, -Math.PI / 2, Math.PI * 1.5]} />
        <meshBasicMaterial color={GOLD} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, OSTEON_H, 48, 1, true]} />
        <meshStandardMaterial color="#5a3a2a" roughness={0.9} side={THREE.BackSide} />
      </mesh>
      <mesh position={[-0.08, 0.15, 0.07]}><cylinderGeometry args={[0.06, 0.06, OSTEON_H + 0.7, 20]} /><meshStandardMaterial color={ARTERY} roughness={0.45} /></mesh>
      <mesh position={[0.07, 0.15, -0.06]}><cylinderGeometry args={[0.08, 0.08, OSTEON_H + 0.7, 20]} /><meshStandardMaterial color={VEIN} roughness={0.45} /></mesh>
      <mesh position={[0.09, 0.15, 0.1]}><cylinderGeometry args={[0.03, 0.03, OSTEON_H + 0.7, 12]} /><meshStandardMaterial color="#e8d27a" roughness={0.5} /></mesh>
      <mesh position={[0, -0.75, 0.9]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 1.4, 24]} /><meshStandardMaterial color="#5a3a2a" roughness={0.9} /></mesh>
      <mesh position={[0, -0.75, 0.95]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.045, 0.045, 1.5, 12]} /><meshStandardMaterial color={ARTERY} /></mesh>
      <instancedMesh ref={lacunaRef} args={[undefined, undefined, lacunae.length]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#5a4632" roughness={0.7} />
      </instancedMesh>
      <lineSegments geometry={canaliculi}><lineBasicMaterial color="#6b5236" /></lineSegments>
      <Label position={[0, OSTEON_H / 2 + 0.5, 0]}>Central canal · artery, vein, nerve</Label>
      <Label position={[0, 0.85, 0.83]}>Concentric lamellae</Label>
      <Label position={[0, -0.01, 0.58]}>Osteocyte in lacuna</Label>
      <Label position={[0, -0.75, 1.62]}>Perforating (Volkmann) canal</Label>
      <Label position={[-1.24, OSTEON_H / 2, 0]} left>Cement line</Label>
      <Label position={[-0.74, -0.45, 0]} left>Canaliculi</Label>
    </Sway>
  );
};

/* ─── Bone cells ─────────────────────────────────────── */

const PIT_X = 1.3;
const pitDepth = (x: number, z: number) => {
  const f = Math.max(0, 1 - ((x - PIT_X) / 0.85) ** 2 - (z / 0.95) ** 2);
  return 0.4 * f ** 0.7;
};

const BoneCells: React.FC = () => {
  const data = useMemo(() => {
    const surface = new THREE.PlaneGeometry(5, 2.4, 100, 48);
    surface.rotateX(-Math.PI / 2);
    const pos = surface.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, -pitDepth(pos.getX(i), pos.getZ(i)));
    surface.computeVertexNormals();
    const rand = rng(3);
    const osteocytes: THREE.Vector3[] = [];
    while (osteocytes.length < 14) {
      const p = new THREE.Vector3(-2.2 + rand() * 4.4, -0.3 - rand() * 0.7, -0.9 + rand() * 1.8);
      if (p.y > -pitDepth(p.x, p.z) - 0.15) continue;
      if (osteocytes.some((q) => q.distanceTo(p) < 0.5)) continue;
      osteocytes.push(p);
    }
    const links: number[] = [];
    osteocytes.forEach((p) => {
      [...osteocytes].sort((a, b) => a.distanceTo(p) - b.distanceTo(p)).slice(1, 3).forEach((q) => links.push(...p.toArray(), ...q.toArray()));
      if (p.y > -0.6) links.push(...p.toArray(), p.x + 0.05, -pitDepth(p.x, p.z) - 0.01, p.z);
    });
    const dendrites = new THREE.BufferGeometry();
    dendrites.setAttribute('position', new THREE.Float32BufferAttribute(links, 3));
    const blasts: THREE.Vector3[] = [];
    for (let x = -2.15; x <= -0.1; x += 0.34) for (const z of [-0.55, -0.18, 0.19, 0.56]) blasts.push(new THREE.Vector3(x, 0.24, z));
    const nuclei = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(PIT_X - 0.45 + (i % 3) * 0.42, -0.1, i < 3 ? -0.2 : 0.2));
    const villi = Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return new THREE.Vector3(PIT_X + Math.cos(a) * 0.45 * (0.6 + (i % 2) * 0.4), -0.34, Math.sin(a) * 0.32 * (0.6 + (i % 2) * 0.4));
    });
    return { surface, osteocytes, dendrites, blasts, nuclei, villi, blastGeometry: new RoundedBoxGeometry(0.3, 0.34, 0.3, 3, 0.08) };
  }, []);
  useEffect(() => () => { data.surface.dispose(); data.dendrites.dispose(); data.blastGeometry.dispose(); }, [data]);

  const blastRef = useRef<THREE.InstancedMesh>(null);
  const cyteRef = useRef<THREE.InstancedMesh>(null);
  const clast = useRef<THREE.Group>(null);
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    data.blasts.forEach((p, i) => blastRef.current?.setMatrixAt(i, m.compose(p, q, new THREE.Vector3(1, 1, 1))));
    data.osteocytes.forEach((p, i) => cyteRef.current?.setMatrixAt(i, m.compose(p, q, new THREE.Vector3(0.17, 0.08, 0.11))));
    if (blastRef.current) blastRef.current.instanceMatrix.needsUpdate = true;
    if (cyteRef.current) cyteRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);
  useFrame((state) => { if (clast.current) clast.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.025); });

  return (
    <Sway amount={0.25} speed={0.25}>
      <mesh geometry={data.surface}><meshStandardMaterial color={BONE} roughness={0.85} /></mesh>
      <mesh position={[0, -0.64, 0]}>
        <boxGeometry args={[5, 1.2, 2.4]} />
        <meshStandardMaterial color={BONE_LIGHT} transparent opacity={0.32} depthWrite={false} roughness={0.9} />
      </mesh>
      <mesh position={[-1.13, 0.035, 0]}><boxGeometry args={[2.25, 0.07, 1.5]} /><meshStandardMaterial color={OSTEOID} roughness={0.8} /></mesh>
      <instancedMesh ref={blastRef} args={[data.blastGeometry, undefined, data.blasts.length]}>
        <meshStandardMaterial color={OSTEOBLAST} roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={cyteRef} args={[undefined, undefined, data.osteocytes.length]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#8f6f9b" roughness={0.6} />
      </instancedMesh>
      <lineSegments geometry={data.dendrites}><lineBasicMaterial color="#a98bb3" /></lineSegments>
      <group ref={clast}>
        <mesh position={[PIT_X, -0.13, 0]} scale={[0.85, 0.25, 0.62]}>
          <sphereGeometry args={[1, 40, 24]} />
          <meshStandardMaterial color={OSTEOCLAST} roughness={0.5} transparent opacity={0.82} />
        </mesh>
        {data.nuclei.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.075, 16, 12]} /><meshStandardMaterial color="#4b2340" /></mesh>)}
        {data.villi.map((p, i) => <mesh key={i} position={p}><cylinderGeometry args={[0.018, 0.018, 0.09, 6]} /><meshStandardMaterial color="#d995b0" /></mesh>)}
      </group>
      <Label position={[-1.2, 0.5, 0.6]}>Osteoblasts</Label>
      <Label position={[-0.1, 0.06, 0.78]}>Osteoid seam</Label>
      <Label position={[-1.6, -0.55, 1.2]} left>Osteocytes in lacunae</Label>
      <Label position={[-0.4, -0.75, 1.2]}>Canaliculi</Label>
      <Label position={[PIT_X, 0.18, 0.3]}>Osteoclast (multinucleated)</Label>
      <Label position={[PIT_X + 0.55, -0.36, 0.62]}>Howship lacuna · ruffled border</Label>
    </Sway>
  );
};

/* ─── Growth plate ───────────────────────────────────── */

const ZONES = [
  { name: 'Reserve zone', top: 2.3, bottom: 1.6, color: CARTILAGE, opacity: 0.16 },
  { name: 'Proliferative zone', top: 1.6, bottom: 0.5, color: CARTILAGE, opacity: 0.16 },
  { name: 'Hypertrophic zone', top: 0.5, bottom: -0.5, color: CARTILAGE, opacity: 0.16 },
  { name: 'Zone of calcification', top: -0.5, bottom: -0.85, color: '#d9c27a', opacity: 0.35 },
  { name: 'Zone of ossification', top: -0.85, bottom: -1.8, color: BONE, opacity: 0.08 },
];
const COLUMNS = [-0.9, -0.3, 0.3, 0.9].flatMap((x) => [-0.35, 0.35].map((z) => [x, z] as const));

const GrowthPlate: React.FC = () => {
  const cells = useMemo(() => {
    const rand = rng(5);
    const reserve = Array.from({ length: 26 }, () => new THREE.Vector3(-1.2 + rand() * 2.4, 1.7 + rand() * 0.5, -0.6 + rand() * 1.2));
    const proliferative = COLUMNS.flatMap(([x, z]) => Array.from({ length: 9 }, (_, k) => new THREE.Vector3(x, 0.58 + k * 0.115, z)));
    const hypertrophic = COLUMNS.flatMap(([x, z]) => [0.32, -0.02, -0.34].map((y, k) => ({ p: new THREE.Vector3(x, y, z), s: 0.15 + k * 0.035 })));
    const dying = COLUMNS.map(([x, z]) => new THREE.Vector3(x, -0.67, z));
    return { reserve, proliferative, hypertrophic, dying };
  }, []);
  const refs = { reserve: useRef<THREE.InstancedMesh>(null), prolif: useRef<THREE.InstancedMesh>(null), hyper: useRef<THREE.InstancedMesh>(null), dying: useRef<THREE.InstancedMesh>(null) };
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const set = (ref: React.RefObject<THREE.InstancedMesh | null>, list: { p: THREE.Vector3; s: THREE.Vector3 }[]) => {
      list.forEach(({ p, s }, i) => ref.current?.setMatrixAt(i, m.compose(p, q, s)));
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    };
    set(refs.reserve, cells.reserve.map((p) => ({ p, s: new THREE.Vector3(0.07, 0.07, 0.07) })));
    set(refs.prolif, cells.proliferative.map((p) => ({ p, s: new THREE.Vector3(0.16, 0.045, 0.16) })));
    set(refs.hyper, cells.hypertrophic.map(({ p, s }) => ({ p, s: new THREE.Vector3(s, s * 0.95, s) })));
    set(refs.dying, cells.dying.map((p) => ({ p, s: new THREE.Vector3(0.09, 0.07, 0.09) })));
  }, [cells, refs.reserve, refs.prolif, refs.hyper, refs.dying]);

  return (
    <Sway amount={0.3} speed={0.22}>
      {ZONES.map((zone) => (
        <mesh key={zone.name} position={[0, (zone.top + zone.bottom) / 2, 0]}>
          <boxGeometry args={[2.7, zone.top - zone.bottom, 1.5]} />
          <meshStandardMaterial color={zone.color} transparent opacity={zone.opacity} depthWrite={false} roughness={0.6} />
        </mesh>
      ))}
      {ZONES.slice(1).map((zone) => (
        <mesh key={`${zone.name}-edge`} position={[0, zone.top, 0]}>
          <boxGeometry args={[2.72, 0.006, 1.52]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.5} />
        </mesh>
      ))}
      <instancedMesh ref={refs.reserve} args={[undefined, undefined, cells.reserve.length]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#7fa3b3" roughness={0.5} /></instancedMesh>
      <instancedMesh ref={refs.prolif} args={[undefined, undefined, cells.proliferative.length]}><cylinderGeometry args={[1, 1, 1, 20]} /><meshStandardMaterial color="#6f97aa" roughness={0.5} /></instancedMesh>
      <instancedMesh ref={refs.hyper} args={[undefined, undefined, cells.hypertrophic.length]}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#9cbecb" roughness={0.4} transparent opacity={0.9} /></instancedMesh>
      <instancedMesh ref={refs.dying} args={[undefined, undefined, cells.dying.length]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#8a7a55" roughness={0.7} /></instancedMesh>
      {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => [-0.55, 0.55].map((z) => (
        <mesh key={`${x}${z}`} position={[x, -1.3, z]}><boxGeometry args={[0.12, 0.95, 0.12]} /><meshStandardMaterial color={BONE_LIGHT} roughness={0.8} /></mesh>
      )))}
      {COLUMNS.map(([x, z]) => (
        <group key={`v${x}${z}`} position={[x, -1.2, z]}>
          <mesh><cylinderGeometry args={[0.05, 0.05, 1.1, 10]} /><meshStandardMaterial color={ARTERY} roughness={0.45} /></mesh>
          <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color={ARTERY} roughness={0.45} /></mesh>
          <mesh position={[0.12, 0.1, 0]}><sphereGeometry args={[0.05, 10, 8]} /><meshStandardMaterial color={OSTEOBLAST} /></mesh>
        </group>
      ))}
      <mesh position={[0, -1.85, 0]}><boxGeometry args={[2.7, 0.1, 1.5]} /><meshStandardMaterial color={BONE} roughness={0.85} /></mesh>
      {ZONES.map((zone) => <Label key={zone.name} position={[1.38, (zone.top + zone.bottom) / 2, 0.75]}>{zone.name}</Label>)}
      <Label position={[-1.38, 2.3, 0.75]} left>Epiphysis ↑</Label>
      <Label position={[-1.38, -1.8, 0.75]} left>Metaphysis ↓</Label>
      <Label position={[-0.6, -1.3, 0.75]} left>Capillary invasion</Label>
    </Sway>
  );
};

/* ─── Remodelling (animated BMU) ─────────────────────── */

const NX = 56;
const NZ = 12;
const CELL = 0.075;
const BASE_Y = -0.2;
const FULL_H = 0.5;
const OLD = new THREE.Color('#e3d8c0');
const OSTEOID_C = new THREE.Color(OSTEOID);
const NEW = new THREE.Color('#f2dc9a');

const Remodelling: React.FC = () => {
  const columns = useRef<THREE.InstancedMesh>(null);
  const clast = useRef<THREE.Group>(null);
  const blasts = useRef<THREE.Group>(null);
  const scratch = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), p: new THREE.Vector3(), s: new THREE.Vector3(), c: new THREE.Color() }), []);
  const xAt = (i: number) => (i - (NX - 1) / 2) * CELL;
  const zAt = (k: number) => (k - (NZ - 1) / 2) * CELL;
  const surfaceAt = (front: number, x: number, z: number) => {
    const s = front - x;
    const across = Math.max(0, 1 - (z / 0.42) ** 2);
    let depth = 0;
    let fill = 0;
    if (s >= 0 && s < 0.7) depth = 0.3 * smooth(0, 0.35, s);
    else if (s >= 0.7 && s < 1.0) depth = 0.3;
    else if (s >= 1.0) { fill = smooth(1.0, 2.6, s); depth = 0.3 * (1 - fill); }
    return { height: FULL_H - depth * across, s, fill, across };
  };

  useFrame((state) => {
    const mesh = columns.current;
    if (!mesh) return;
    const front = -2.3 + ((state.clock.elapsedTime * 0.42) % 7.2);
    const { m, q, p, s: scale, c } = scratch;
    for (let i = 0; i < NX; i++) {
      for (let k = 0; k < NZ; k++) {
        const x = xAt(i);
        const z = zAt(k);
        const { height, s, fill, across } = surfaceAt(front, x, z);
        p.set(x, BASE_Y + height / 2, z);
        scale.set(CELL * 0.98, height, CELL * 0.98);
        mesh.setMatrixAt(i * NZ + k, m.compose(p, q, scale));
        if (s < 1.0 || across === 0) c.copy(OLD);
        else if (s < 2.6) c.copy(OSTEOID_C).lerp(NEW, fill * 0.6);
        else c.copy(NEW).lerp(OLD, smooth(2.6, 5.5, s));
        mesh.setColorAt(i * NZ + k, c);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    const half = (NX * CELL) / 2;
    if (clast.current) {
      clast.current.position.set(front - 0.22, BASE_Y + FULL_H - 0.18, 0);
      clast.current.visible = front - 0.22 > -half && front - 0.22 < half;
    }
    if (blasts.current) {
      blasts.current.children.forEach((child, idx) => {
        if (!(child instanceof THREE.Mesh)) return;
        const x = front - 1.25 - idx * 0.24;
        child.position.set(x, BASE_Y + surfaceAt(front, x, 0).height + 0.08, ((idx % 2) - 0.5) * 0.22);
        child.visible = x > -half && x < half;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, BASE_Y - 0.4, 0]}>
        <boxGeometry args={[NX * CELL, 0.8, NZ * CELL]} />
        <meshStandardMaterial color={OLD} roughness={0.85} />
      </mesh>
      <instancedMesh ref={columns} args={[undefined, undefined, NX * NZ]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
      <group ref={clast}>
        <mesh scale={[0.4, 0.17, 0.34]}><sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color={OSTEOCLAST} roughness={0.5} transparent opacity={0.88} /></mesh>
        {[-0.18, 0, 0.18].map((x) => <mesh key={x} position={[x, 0.02, 0]}><sphereGeometry args={[0.05, 12, 8]} /><meshStandardMaterial color="#4b2340" /></mesh>)}
        <Label position={[0, 0.25, 0]}>Osteoclasts resorb</Label>
      </group>
      <group ref={blasts}>
        {Array.from({ length: 7 }, (_, i) => <mesh key={i}><sphereGeometry args={[0.08, 16, 12]} /><meshStandardMaterial color={OSTEOBLAST} roughness={0.55} /></mesh>)}
      </group>
      <Label position={[-1.75, 0.55, 0.45]} left>Old bone</Label>
      <RemodelPhaseLabels />
    </group>
  );
};

/** Labels that follow the formation zone behind the osteoclasts. */
const RemodelPhaseLabels: React.FC = () => {
  const formation = useRef<THREE.Group>(null);
  useFrame((state) => {
    const front = -2.3 + ((state.clock.elapsedTime * 0.42) % 7.2);
    const half = (NX * CELL) / 2;
    if (formation.current) {
      const x = front - 1.9;
      formation.current.position.set(x, 0.45, 0.4);
      formation.current.visible = x > -half && x < half;
    }
  });
  return <group ref={formation}><Label position={[0, 0, 0]}>Osteoblasts refill with osteoid</Label></group>;
};

/* ─── Fracture healing ───────────────────────────────── */

const STAGE_TARGETS = [
  { hematoma: 1, soft: 0, hard: 0, remodel: 0, gap: 0 },
  { hematoma: 0, soft: 1, hard: 0, remodel: 0, gap: 0 },
  { hematoma: 0, soft: 0, hard: 1, remodel: 0, gap: 1 },
  { hematoma: 0, soft: 0, hard: 0, remodel: 1, gap: 1 },
];

const Fracture: React.FC<{ stage: number }> = ({ stage }) => {
  const hematoma = useRef<THREE.Mesh>(null);
  const soft = useRef<THREE.Mesh>(null);
  const hard = useRef<THREE.Mesh>(null);
  const bridge = useRef<THREE.Mesh>(null);
  const lumpy = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 5);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const rand = rng(9);
    const bumps = Array.from({ length: 18 }, () => new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize());
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const bump = bumps.reduce((sum, b) => sum + Math.max(0, n.dot(b) - 0.85) * 0.5, 0);
      v.multiplyScalar(1 + bump);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => lumpy.dispose(), [lumpy]);

  useFrame((_, delta) => {
    const t = STAGE_TARGETS[stage];
    const ease = 1 - Math.exp(-delta * 4);
    const fade = (mesh: THREE.Mesh | null, target: number, max = 1) => {
      if (!mesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity += (target * max - mat.opacity) * ease;
      mesh.visible = mat.opacity > 0.02;
    };
    fade(hematoma.current, t.hematoma, 0.85);
    fade(soft.current, t.soft, 0.8);
    fade(hard.current, Math.max(t.hard, t.remodel));
    fade(bridge.current, t.gap);
    if (hard.current) {
      const target = t.remodel ? new THREE.Vector3(0.95, 0.37, 0.37) : new THREE.Vector3(1.2, 0.6, 0.6);
      hard.current.scale.lerp(target, ease);
    }
  });

  const labels = [
    <Label key={0} position={[0, 0.65, 0.3]}>Fracture haematoma</Label>,
    <Label key={1} position={[0, 0.72, 0.3]}>Soft callus · fibrocartilage</Label>,
    <Label key={2} position={[0, 0.72, 0.3]}>Hard callus · woven bone</Label>,
    <Label key={3} position={[0, 0.5, 0.3]}>Remodelled · lamellar bone</Label>,
  ];
  return (
    <Sway amount={0.4} speed={0.25}>
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, 1.05, 0]}><cylinderGeometry args={[0.34, 0.34, 1.9, 48]} /><meshStandardMaterial color={BONE} roughness={0.75} /></mesh>
        <mesh position={[0, -1.05, 0]}><cylinderGeometry args={[0.34, 0.34, 1.9, 48]} /><meshStandardMaterial color={BONE} roughness={0.75} /></mesh>
        <mesh ref={bridge}><cylinderGeometry args={[0.335, 0.335, 0.22, 48]} /><meshStandardMaterial color={BONE_LIGHT} roughness={0.8} transparent opacity={0} /></mesh>
      </group>
      <mesh ref={hematoma} scale={[0.55, 0.55, 0.55]}><sphereGeometry args={[1, 32, 24]} /><meshStandardMaterial color="#7d1d1d" roughness={0.4} transparent opacity={0.85} /></mesh>
      <mesh ref={soft} scale={[1.25, 0.6, 0.6]}><sphereGeometry args={[1, 40, 28]} /><meshStandardMaterial color={CARTILAGE} roughness={0.35} transparent opacity={0} /></mesh>
      <mesh ref={hard} geometry={lumpy} scale={[1.2, 0.6, 0.6]}><meshStandardMaterial color="#e2d6b8" roughness={0.9} transparent opacity={0} /></mesh>
      {labels[stage]}
      <Label position={[-1.9, 0.4, 0]} left>Proximal fragment</Label>
      <Label position={[1.9, 0.4, 0]}>Distal fragment</Label>
    </Sway>
  );
};

/* ─── Clinical: trabecular bone ──────────────────────── */

function makeLattice(seed: number, keep: number, radius: number) {
  const rand = rng(seed);
  const n = 5;
  const step = 0.4;
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    nodes.push(new THREE.Vector3((i - 2) * step + (rand() - 0.5) * 0.14, (j - 2) * step + (rand() - 0.5) * 0.14, (k - 2) * step + (rand() - 0.5) * 0.14));
  }
  const idx = (i: number, j: number, k: number) => i * n * n + j * n + k;
  const struts: { a: THREE.Vector3; b: THREE.Vector3; r: number }[] = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
    for (const [di, dj, dk] of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) {
      if (i + di >= n || j + dj >= n || k + dk >= n) continue;
      if (rand() > keep * (dj ? 1.15 : 1)) continue;
      struts.push({ a: nodes[idx(i, j, k)], b: nodes[idx(i + di, j + dj, k + dk)], r: radius * (0.75 + rand() * 0.5) });
    }
  }
  return struts;
}

const Lattice: React.FC<{ seed: number; keep: number; radius: number; x: number }> = ({ seed, keep, radius, x }) => {
  const struts = useMemo(() => makeLattice(seed, keep, radius), [seed, keep, radius]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const joints = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    struts.forEach(({ a, b, r }, i) => {
      const dir = b.clone().sub(a);
      q.setFromUnitVectors(up, dir.clone().normalize());
      ref.current?.setMatrixAt(i, m.compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(r, dir.length(), r)));
      joints.current?.setMatrixAt(i, m.compose(a, new THREE.Quaternion(), new THREE.Vector3(r * 1.25, r * 1.25, r * 1.25)));
    });
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true;
    if (joints.current) joints.current.instanceMatrix.needsUpdate = true;
  }, [struts]);
  return (
    <group position={[x, 0, 0]}>
      <instancedMesh ref={ref} args={[undefined, undefined, struts.length]}><cylinderGeometry args={[1, 1, 1, 10]} /><meshStandardMaterial color={BONE_LIGHT} roughness={0.7} /></instancedMesh>
      <instancedMesh ref={joints} args={[undefined, undefined, struts.length]}><sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={BONE_LIGHT} roughness={0.7} /></instancedMesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(1.85, 1.85, 1.85)]} />
        <lineBasicMaterial color={GOLD} transparent opacity={0.45} />
      </lineSegments>
    </group>
  );
};

const Clinical: React.FC = () => (
  <Sway amount={0.45} speed={0.2}>
    <Lattice seed={21} keep={0.9} radius={0.055} x={-1.15} />
    <Lattice seed={21} keep={0.48} radius={0.024} x={1.15} />
    <Label position={[-1.15, 1.25, 0]}>Normal trabecular bone</Label>
    <Label position={[1.15, 1.25, 0]}>Osteoporosis</Label>
  </Sway>
);

/* ─── Canvas host ────────────────────────────────────── */

const CAMERAS: Record<TopicId, { position: Vec3; target: Vec3 }> = {
  cells: { position: [0.4, 3.7, 6.8], target: [0, -0.3, 0] },
  structure: { position: [-4.9, 0.6, 4.9], target: [0, 0, 0] },
  osteon: { position: [-4.6, 3.3, 4.6], target: [0, -0.1, 0] },
  growth: { position: [2.8, 1.0, 8.2], target: [0, 0.2, 0] },
  remodel: { position: [0.7, 3.2, 5.8], target: [0, -0.1, 0] },
  fracture: { position: [0, 1.6, 5.8], target: [0, 0, 0] },
  clinical: { position: [0, 1.9, 7.6], target: [0, 0, 0] },
};

const CameraRig: React.FC<{ topic: TopicId }> = ({ topic }) => {
  const camera = useThree((state) => state.camera);
  const controls = useThree((state) => state.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  useEffect(() => {
    const preset = CAMERAS[topic];
    camera.position.set(...preset.position);
    controls?.target.set(...preset.target);
    controls?.update();
  }, [topic, camera, controls]);
  return null;
};

const BoneScenes: React.FC<{ topic: TopicId; fractureStage: number; active: boolean }> = ({ topic, fractureStage, active }) => {
  const [labels, setLabels] = useState<LabelEntry[]>([]);
  const layer = useRef<HTMLDivElement>(null);
  const registry = useMemo(() => ({
    add: (entry: LabelEntry) => setLabels((list) => [...list, entry]),
    remove: (id: number) => setLabels((list) => list.filter((label) => label.id !== id)),
  }), []);
  return (
    <LabelContext.Provider value={registry}>
      <Canvas frameloop={active ? 'always' : 'never'} camera={{ position: CAMERAS[topic].position, fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <hemisphereLight args={['#fffaf0', '#1a140c', 0.85]} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} />
        <directionalLight position={[4, 2, -3]} intensity={1.2} color="#e2c25c" />
        <OrbitControls makeDefault enablePan={false} enableZoom={false} rotateSpeed={0.6} />
        <CameraRig topic={topic} />
        {topic === 'cells' && <BoneCells />}
        {topic === 'structure' && <LongBone />}
        {topic === 'osteon' && <Osteon />}
        {topic === 'growth' && <GrowthPlate />}
        {topic === 'remodel' && <Remodelling />}
        {topic === 'fracture' && <Fracture stage={fractureStage} />}
        {topic === 'clinical' && <Clinical />}
        <LabelProjector layer={layer} labels={labels} />
      </Canvas>
      <div ref={layer} className={styles.labelLayer} aria-hidden="true">
        {labels.map((label) => (
          <div key={label.id} data-label={label.id} className={styles.labelAnchor}>
            <div className={`${styles.label} ${label.left ? styles.labelLeft : ''}`}><i />{label.text}</div>
          </div>
        ))}
      </div>
    </LabelContext.Provider>
  );
};

export default BoneScenes;
