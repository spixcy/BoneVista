import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DragRotateGroup, useDragRotate, type DragRotateState } from '../../hooks/useDragRotate';

const ATLAS_URL = '/anatomy/skeletal_male.glb';
const DRACO_URL = '/draco/gltf/';

// The loader strips spaces and dots from node names, so compare a normalised form.
const norm = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

export type ViewMode = 'isolated' | 'context';

interface Props {
  node: string;
  knownNodes: string[];
  mode: ViewMode;
  wireframe: boolean;
  autoRotate: boolean;
  resetKey: number;
  onPick: (node: string) => void;
  /** Spans that receive the live camera azimuth / elevation, written directly to avoid re-renders. */
  telemetry?: React.RefObject<{ azimuth: HTMLElement | null; elevation: HTMLElement | null }>;
}

type Controls = { target: THREE.Vector3; update: () => void };

// The camera always looks at the bone from slightly above the front; dragging turns the bone itself.
const VIEW_DIRECTION = new THREE.Vector3(0, 0.12, 1).normalize();

const Skeleton: React.FC<Props & { rotation: React.RefObject<DragRotateState> }> = ({ node, knownNodes, mode, wireframe, autoRotate, resetKey, onPick, telemetry, rotation }) => {
  const { scene } = useGLTF(ATLAS_URL, DRACO_URL);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const controls = useThree((state) => state.controls) as unknown as Controls | null;

  const atlas = useMemo(() => {
    const model = scene.clone(true);
    const known = new Map(knownNodes.map((name) => [norm(name), name]));
    const owners = new Map<THREE.Mesh, string | null>();
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      let owner: string | null = null;
      for (let n: THREE.Object3D | null = object; n && !owner; n = n.parent) owner = known.get(norm(n.name)) ?? null;
      owners.set(object, owner);
    });
    const materials = {
      bone: new THREE.MeshStandardMaterial({ color: '#ece4d2', roughness: 0.62, metalness: 0.04 }),
      selected: new THREE.MeshStandardMaterial({ color: '#e9cf86', roughness: 0.45, metalness: 0.18, emissive: '#3a2a06', emissiveIntensity: 0.6 }),
      ghost: new THREE.MeshStandardMaterial({ color: '#b9b09c', roughness: 0.8, transparent: true, opacity: 0.16, depthWrite: false }),
    };
    model.updateMatrixWorld(true);
    return { model, owners, materials };
  }, [scene, knownNodes]);
  useEffect(() => () => Object.values(atlas.materials).forEach((m) => m.dispose()), [atlas]);

  // Where the camera should end up; the frame loop eases towards it.
  const goal = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  // The selected bone's centre: the model turns about this point.
  const [pivot, setPivot] = useState(() => new THREE.Vector3());

  useEffect(() => {
    const key = norm(node);
    const box = new THREE.Box3();
    atlas.owners.forEach((owner, mesh) => {
      const selected = owner !== null && norm(owner) === key;
      mesh.visible = selected || mode === 'context';
      mesh.material = selected ? (mode === 'context' ? atlas.materials.selected : atlas.materials.bone) : atlas.materials.ghost;
      mesh.renderOrder = selected ? 1 : 0;
      if (selected) box.expandByObject(mesh);
    });
    atlas.materials.bone.wireframe = wireframe;
    atlas.materials.selected.wireframe = wireframe;
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getBoundingSphere(new THREE.Sphere()).radius;
    // Fit to whichever field of view is narrower, so tall phone screens don't crop the bone sideways.
    const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
    const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
    const fit = (radius / Math.sin(Math.min(vertical, horizontal))) * (mode === 'context' ? 3.2 : 1.25);
    camera.near = Math.max(radius / 200, 0.0005);
    camera.far = fit * 40;
    camera.updateProjectionMatrix();
    setPivot((previous) => (previous.equals(center) ? previous : center));
    goal.current = { position: center.clone().addScaledVector(VIEW_DIRECTION, fit), target: center };
  }, [node, mode, wireframe, atlas, camera, controls, resetKey]);

  // A new bone, or Re-centre, starts upright and facing the viewer.
  useEffect(() => {
    rotation.current.quaternion.identity();
    rotation.current.velocity.set(0, 0);
  }, [node, resetKey, rotation]);

  // Telemetry comes from the bone's own orientation, written straight to the DOM.
  const readout = useRef({ azimuth: NaN, elevation: NaN });
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), []);
  const report = (quaternion: THREE.Quaternion) => {
    if (!telemetry?.current) return;
    euler.setFromQuaternion(quaternion, 'YXZ');
    const azimuth = Math.round(((THREE.MathUtils.radToDeg(euler.y) % 360) + 360) % 360);
    const elevation = Math.round(THREE.MathUtils.radToDeg(euler.x));
    const { azimuth: az, elevation: el } = telemetry.current;
    if (az && azimuth !== readout.current.azimuth) az.textContent = `${String(azimuth).padStart(3, '0')}°`;
    if (el && elevation !== readout.current.elevation) el.textContent = `${elevation > 0 ? '+' : ''}${elevation}°`;
    readout.current = { azimuth, elevation };
  };

  useFrame((_, delta) => {
    if (!goal.current || !controls) return;
    const ease = 1 - Math.exp(-delta * 5);
    camera.position.lerp(goal.current.position, ease);
    controls.target.lerp(goal.current.target, ease);
    controls.update();
    if (camera.position.distanceTo(goal.current.position) < 1e-4) goal.current = null;
  });

  const pick = (event: ThreeEvent<MouseEvent>) => {
    if (mode !== 'context' || event.delta > 4) return;
    event.stopPropagation();
    const owner = atlas.owners.get(event.object as THREE.Mesh);
    if (owner) onPick(owner);
  };

  return (
    <>
      <DragRotateGroup state={rotation} autoRotate={autoRotate} position={pivot.toArray() as [number, number, number]} onFrame={report}>
        <group position={pivot.clone().multiplyScalar(-1).toArray() as [number, number, number]}>
          <primitive object={atlas.model} onClick={pick} />
        </group>
      </DragRotateGroup>
      {/* Dragging rotates the model (useDragRotate); the controls only zoom. */}
      <OrbitControls makeDefault enableRotate={false} enablePan={false} enableDamping dampingFactor={0.08} onStart={() => { goal.current = null; }} />
    </>
  );
};

const BoneViewer: React.FC<Props> = (props) => {
  const surface = useRef<HTMLDivElement>(null);
  const rotation = useDragRotate(surface);
  return (
    <div ref={surface} style={{ position: 'absolute', inset: 0 }}>
      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 32 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
        <hemisphereLight args={['#fffaf0', '#17120b', 0.9]} />
        <directionalLight position={[-3, 4, 5]} intensity={2.3} />
        <directionalLight position={[4, 1.5, -3]} intensity={1.5} color="#e2c25c" />
        <directionalLight position={[0, -3, 2]} intensity={0.4} color="#c9b48a" />
        <Suspense fallback={null}>
          <Skeleton {...props} rotation={rotation} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default BoneViewer;
