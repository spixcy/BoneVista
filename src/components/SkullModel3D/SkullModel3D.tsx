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

const Skull: React.FC<{ pointer: Pointer }> = ({ pointer }) => {
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
    const p = pointer.current;
    const targetY = -0.62 + p.x * 0.35 + Math.sin(now * 0.25) * 0.08;
    const targetX = 0.06 + p.y * 0.18;
    const ease = 1 - Math.exp(-delta * 3);
    group.current.rotation.y += (targetY - group.current.rotation.y) * ease;
    group.current.rotation.x += (targetX - group.current.rotation.x) * ease;
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
  const visible = useInView(wrap, { margin: '80px 0px' });

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
    <div ref={wrap} className={`${styles.wrap} ${className ?? ''}`} aria-hidden="true">
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
          <Skull pointer={pointer} />
        </Suspense>
      </Canvas>
      <div className={styles.plinth} />
    </div>
  );
};

export default SkullModel3D;
