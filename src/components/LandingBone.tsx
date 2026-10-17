import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Rotation = [number, number, number];
type BoneSpec = { name: string; x: number; y: number; scale: number; rotation: Rotation; speed: number };

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const RotatingBone: React.FC<{ spec: BoneSpec }> = ({ spec }) => {
  const { scene } = useGLTF('/anatomy/skeletal_male.glb', '/draco/gltf/');
  const viewport = useThree((state) => state.viewport);
  const bone = useMemo(() => {
    const model = scene.clone(true);
    const boneNodes = new Set<THREE.Object3D>();
    model.traverse((object) => { if (normalize(object.name) === normalize(spec.name)) boneNodes.add(object); });
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      let parent: THREE.Object3D | null = object;
      let belongsToBone = false;
      while (parent && !belongsToBone) { belongsToBone = boneNodes.has(parent); parent = parent.parent; }
      object.visible = belongsToBone;
      if (belongsToBone) object.material = new THREE.MeshBasicMaterial({ color: '#243bb4', wireframe: true, transparent: true, opacity: 0.98 });
    });
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    model.traverse((object) => { if (object instanceof THREE.Mesh && object.visible) bounds.expandByObject(object); });
    const center = bounds.isEmpty() ? new THREE.Vector3() : bounds.getCenter(new THREE.Vector3());
    const largestSide = Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
    // Keep each decorative bone in the background at a deliberate accent size.
    // The previous multi-unit scale filled most of the section canvas and cut
    // through the hero copy and card layouts.
    const decorativeSize = Math.min(spec.scale, 1.2);
    const scale = largestSide > 0 ? decorativeSize / largestSide : 1;
    return { model, center, scale };
  }, [scene, spec.name, spec.scale]);
  const rotation = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!rotation.current) return;
    const time = state.clock.elapsedTime;
    const edgePosition = spec.x < 0 ? Math.min(spec.x, -0.52) : Math.max(spec.x, 0.35);
    rotation.current.position.set(edgePosition * viewport.width, spec.y * viewport.height + Math.sin(time * 0.45 + spec.rotation[1]) * 0.07, 0);
    rotation.current.rotation.set(
      spec.rotation[0] + Math.sin(time * 0.2 + spec.rotation[1]) * 0.08,
      spec.rotation[1] + time * spec.speed * 1.35,
      spec.rotation[2] + Math.cos(time * 0.17 + spec.rotation[0]) * 0.06,
    );
  });

  return <group ref={rotation} scale={bone.scale}>
    <group position={bone.center.clone().multiplyScalar(-1)}><primitive object={bone.model} /></group>
  </group>;
};

const LandingBone: React.FC<{ className: string; bones: BoneSpec[] }> = ({ className, bones }) => (
  <div className={className} aria-hidden="true">
    <Canvas camera={{ position: [0, 0.1, 4.1], fov: 36 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.4} />
      <React.Suspense fallback={null}>{bones.map((spec) => <RotatingBone key={spec.name} spec={spec} />)}</React.Suspense>
    </Canvas>
  </div>
);

export default LandingBone;
