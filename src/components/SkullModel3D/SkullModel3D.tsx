import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';
import styles from './SkullModel3D.module.css';

// The loader strips spaces and dots from node names, so compare a normalised form.
const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

// Bones of the cranium, face and jaw in the reference skeleton.
const SKULL_NODES = new Set([
  'Frontal bone', 'Parietal bone.l', 'Parietal bone.r', 'Occipital bone', 'Temporal bone.l', 'Temporal bone.r',
  'Sphenoid bone', 'Ethmoid bone', 'Zygomatic bone.l', 'Zygomatic bone.r', 'Maxilla.l', 'Maxilla.r',
  'Nasal bone.l', 'Nasal bone.r', 'Lacrimal bone.l', 'Lacrimal bone.r', 'Palatine bone.l', 'Palatine bone.r',
  'Vomer', 'Inferior nasal concha bone.l', 'Inferior nasal concha bone.r', 'Mandible',
].map(normalize));
const TOOTH = /(incisor|canine|premolar|molartooth)/;

const BONE_COLOR = new THREE.Color('#e3d9c4');
const TOOTH_COLOR = new THREE.Color('#f1ead9');
const WIRE_COLOR = new THREE.Color('#d4af37');

type Pointer = React.RefObject<{ x: number; y: number }>;

/** Drag state shared between the DOM handlers and the render loop. */
type Spin = { dragging: boolean; yaw: number; pitch: number; velocity: number; idleSince: number };
type SpinRef = React.RefObject<Spin>;

const REST_YAW = -0.62;
const REST_PITCH = 0.06;
const TAU = Math.PI * 2;

const Skull: React.FC<{ pointer: Pointer; spin: SpinRef; wrap: React.RefObject<HTMLDivElement | null> }> = ({ pointer, spin, wrap }) => {
  const { scene } = useGLTF('/anatomy/skeletal_male.glb', '/draco/gltf/');
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);

  const skull = useMemo(() => {
    const model = scene.clone(true);
    const solids: THREE.MeshStandardMaterial[] = [];
    const wires: THREE.MeshBasicMaterial[] = [];
    const inSkull = (object: THREE.Object3D) => {
      for (let node: THREE.Object3D | null = object; node; node = node.parent) {
        const key = normalize(node.name);
        if (SKULL_NODES.has(key) || TOOTH.test(key)) return key;
      }
      return null;
    };
    const meshes: THREE.Mesh[] = [];
    model.traverse((object) => { if (object instanceof THREE.Mesh) meshes.push(object); });
    for (const mesh of meshes) {
      const owner = inSkull(mesh);
      mesh.visible = owner !== null;
      if (!owner) continue;
      const solid = new THREE.MeshStandardMaterial({
        color: TOOTH.test(owner) ? TOOTH_COLOR : BONE_COLOR,
        roughness: TOOTH.test(owner) ? 0.35 : 0.72,
        metalness: 0.04,
        transparent: true,
        opacity: 0,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      });
      const wire = new THREE.MeshBasicMaterial({ color: WIRE_COLOR, wireframe: true, transparent: true, opacity: 0, depthWrite: false });
      mesh.material = solid;
      mesh.add(new THREE.Mesh(mesh.geometry, wire));
      solids.push(solid);
      wires.push(wire);
    }
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    for (const mesh of meshes) if (mesh.visible) bounds.expandByObject(mesh);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = Math.max(...bounds.getSize(new THREE.Vector3()).toArray()) || 1;
    return { model, solids, wires, center, scale: 2.05 / size };
  }, [scene]);

  useEffect(() => () => {
    skull.solids.forEach((m) => m.dispose());
    skull.wires.forEach((m) => m.dispose());
  }, [skull]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const now = state.clock.elapsedTime;
    if (start.current === null) start.current = now;
    const t = now - start.current;
    // Triangles trace in first, then the bone surface fills in beneath them.
    const wireIn = THREE.MathUtils.smoothstep(t, 0, 1.4);
    const solidIn = THREE.MathUtils.smoothstep(t, 0.9, 2.6);
    const wireOpacity = 0.6 * wireIn * (1 - solidIn) + 0.16 * solidIn;
    for (const m of skull.wires) m.opacity = wireOpacity;
    const opaque = solidIn >= 1;
    for (const m of skull.solids) {
      m.opacity = solidIn;
      if (m.transparent === opaque) { m.transparent = !opaque; m.needsUpdate = true; }
    }
    const s = spin.current;
    const p = pointer.current;
    const idle = performance.now() - s.idleSince > 3500;
    if (!s.dragging) {
      // Momentum after a flick, then ease back to the front-facing pose once idle.
      s.yaw += s.velocity * delta;
      s.velocity *= Math.exp(-delta * 2.5);
      if (idle) {
        const rest = REST_YAW + Math.round((s.yaw - REST_YAW) / TAU) * TAU;
        const settle = 1 - Math.exp(-delta * 1.6);
        s.yaw += (rest - s.yaw) * settle;
        s.pitch += (REST_PITCH - s.pitch) * settle;
      }
    }
    const atRest = !s.dragging && idle && Math.abs(s.velocity) < 0.05;
    const targetY = s.yaw + (atRest ? p.x * 0.35 + Math.sin(now * 0.25) * 0.08 : 0);
    const targetX = s.pitch + (atRest ? p.y * 0.18 : 0);
    const ease = 1 - Math.exp(-delta * (s.dragging ? 14 : 4));
    group.current.rotation.y += (targetY - group.current.rotation.y) * ease;
    group.current.rotation.x += (targetX - group.current.rotation.x) * ease;
    // The bone callouts beside the skull only line up with the front-facing pose.
    const offset = Math.abs((((group.current.rotation.y - REST_YAW) % TAU) + TAU + Math.PI) % TAU - Math.PI);
    const facing = offset < 0.45 && Math.abs(group.current.rotation.x - REST_PITCH) < 0.35 ? 'true' : 'false';
    if (wrap.current && wrap.current.dataset.facing !== facing) wrap.current.dataset.facing = facing;
    group.current.position.y = Math.sin(now * 0.6) * 0.04;
  });

  return (
    <group ref={group} rotation={[0.06, -0.62, 0]}>
      <group scale={skull.scale}>
        <group position={skull.center.clone().multiplyScalar(-1)}>
          <primitive object={skull.model} />
        </group>
      </group>
    </group>
  );
};

/** Realistic, triangle-mesh skull for the landing page hero. */
const SkullModel3D: React.FC<{ className?: string }> = ({ className }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const spin = useRef<Spin>({ dragging: false, yaw: REST_YAW, pitch: REST_PITCH, velocity: 0, idleSince: -Infinity });
  const visible = useInView(wrap, { margin: '80px 0px' });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      el.setPointerCapture(event.pointerId);
      Object.assign(spin.current, { dragging: true, velocity: 0 });
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = performance.now();
    };
    const move = (event: PointerEvent) => {
      const s = spin.current;
      if (!s.dragging) return;
      const now = performance.now();
      const dx = (event.clientX - lastX) * 0.012;
      s.yaw += dx;
      s.pitch = Math.max(-0.6, Math.min(0.7, s.pitch + (event.clientY - lastY) * 0.008));
      s.velocity = dx / Math.max((now - lastT) / 1000, 0.008);
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
    };
    const up = (event: PointerEvent) => {
      const s = spin.current;
      if (!s.dragging) return;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      // A slow release should not fling the skull.
      if (performance.now() - lastT > 80) s.velocity = 0;
      s.velocity = Math.max(-12, Math.min(12, s.velocity));
      Object.assign(s, { dragging: false, idleSince: performance.now() });
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div ref={wrap} className={`${styles.wrap} ${className ?? ''}`} data-facing="true" title="Drag to spin the skull">
      <div className={styles.halo} />
      <Canvas
        className={styles.canvas}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0.02, 4.4], fov: 34 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <hemisphereLight args={['#fffaf0', '#14100a', 0.75]} />
        <directionalLight position={[-3, 3.5, 4]} intensity={2.4} color="#ffffff" />
        <directionalLight position={[4, 1.5, -3]} intensity={1.8} color="#e2c25c" />
        <directionalLight position={[2, -2, 3]} intensity={0.35} color="#c9b48a" />
        <Suspense fallback={null}>
          <Skull pointer={pointer} spin={spin} wrap={wrap} />
        </Suspense>
      </Canvas>
      <div className={styles.plinth} />
      <span className={styles.hint}>Drag to spin 360°</span>
    </div>
  );
};

export default SkullModel3D;
