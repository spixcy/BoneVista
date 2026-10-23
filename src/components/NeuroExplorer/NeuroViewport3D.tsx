import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { NEURO_ASSETS, type NeuroManifest, type NeuroMode, type NeuroStructure } from '../../data/neuroAtlas';
import { useAppStore } from '../../store/appStore';
import styles from '../Viewport3D/Viewport3D.module.css';

const BASE_CAMERA = new THREE.Vector3(0, 0.15, 5.5);

function cloneMeshes(scene: THREE.Group) {
  const clone = scene.clone(true);
  clone.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    object.castShadow = true;
    object.receiveShadow = true;
  });
  return clone;
}

function normalizeGroup(group: THREE.Group, maxSize = 3, include: (object: THREE.Mesh) => boolean = () => true) {
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh && include(object)) bounds.expandByObject(object);
  });
  const size = bounds.getSize(new THREE.Vector3());
  const largest = Math.max(size.x, size.y, size.z) || 1;
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = maxSize / largest;
  group.scale.multiplyScalar(scale);
  group.position.copy(center).multiplyScalar(-scale);
  group.updateMatrixWorld(true);
}

function setNeuroMeshIds(model: THREE.Group, structures: NeuroStructure[], sourceKey: 'brain' | 'nerves', layerId: string) {
  const byMesh = new Map<string, NeuroStructure>();
  const bySourceId = new Map(structures.map((structure) => [String(structure.sourceId), structure]));
  structures.forEach((structure) => structure.meshNames.forEach((name) => byMesh.set(name, structure)));
  const inherited = (object: THREE.Object3D, key: string): unknown => {
    for (let current: THREE.Object3D | null = object; current; current = current.parent) {
      if (current.userData[key] !== undefined) return current.userData[key];
    }
    return undefined;
  };
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const sourceName = sourceKey === 'nerves'
      ? String(inherited(object, 'zname') ?? object.name.replace(/\.\d+$/, ''))
      : object.name;
    const sourceId = inherited(object, 'bx_id');
    const structure = sourceKey === 'brain'
      ? bySourceId.get(String(sourceId))
      : byMesh.get(sourceName);
    if (!structure) {
      object.visible = false;
      return;
    }
    object.userData.neuroStructureId = structure.id;
    object.userData.neuroCategory = structure.category;
    object.userData.neuroLayerId = layerId;
    object.userData.neuroSourceName = sourceKey === 'brain' ? structure.meshNames[0] : sourceName;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      material.emissive.set('#000000');
      material.emissiveIntensity = 1;
      material.roughness = 0.72;
      material.metalness = 0.02;
      if (sourceKey === 'nerves') material.color.set('#69b9c0');
      material.userData.neuroBaseColor = material.color.clone();
      material.userData.neuroBaseEmissive = material.emissive.clone();
    });
  });
}

function applyModelState(
  model: THREE.Group,
  mode: NeuroMode,
  selected: Set<string>,
  hiddenStructures: Set<string>,
  hiddenLayers: Set<string>,
  opacityByLayer: Record<string, number>,
  isolated: boolean,
) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const id = object.userData.neuroStructureId as string | undefined;
    const category = object.userData.neuroCategory as string | undefined;
    const layerId = mode === 'brain-atlas' ? `neuro:brain:${category}` : object.userData.neuroLayerId as string;
    const isVisible = Boolean(id) && !hiddenStructures.has(id!) && !hiddenLayers.has(layerId) && (!isolated || selected.has(id!));
    object.visible = isVisible;
    const opacity = opacityByLayer[layerId] ?? 1;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!(material instanceof THREE.MeshStandardMaterial)) return;
      const baseColor = material.userData.neuroBaseColor as THREE.Color | undefined;
      const baseEmissive = material.userData.neuroBaseEmissive as THREE.Color | undefined;
      const isSelected = Boolean(id && selected.has(id));
      if (baseColor) material.color.copy(isSelected ? new THREE.Color('#72d9ff') : baseColor);
      if (baseEmissive) material.emissive.copy(isSelected ? new THREE.Color('#15628c') : baseEmissive);
      material.transparent = opacity < 1;
      material.opacity = opacity;
      material.depthWrite = opacity >= 1;
    });
  });
}

function FitCamera({ controls, action, mode, model }: {
  controls: React.RefObject<OrbitControlsImpl | null>;
  action: { type: 'focus' | 'fit'; sequence: number };
  mode: NeuroMode;
  model: React.RefObject<THREE.Group | null>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (!controls.current) return;
    controls.current.target.set(0, 0, 0);
    camera.position.copy(BASE_CAMERA);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    controls.current.update();
  }, [mode, camera, controls]);
  useEffect(() => {
    if (action.type !== 'focus' || !controls.current || !model.current) return;
    const selected = useAppStore.getState().selectedNeuroStructures;
    model.current.updateMatrixWorld(true);
    const box = new THREE.Box3();
    model.current.traverse((object) => {
      if (object instanceof THREE.Mesh && selected.has(object.userData.neuroStructureId as string)) box.expandByObject(object);
    });
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const distance = Math.max(size.x, size.y, size.z) * 3.5 + 0.25;
    const direction = camera.position.clone().sub(controls.current.target).normalize();
    controls.current.target.copy(center);
    camera.position.copy(center.clone().add(direction.multiplyScalar(Math.max(distance, 0.45))));
    controls.current.update();
  }, [action.sequence, action.type, camera, controls, model]);
  useEffect(() => {
    if (action.type !== 'fit' || !controls.current) return;
    controls.current.target.set(0, 0, 0);
    camera.position.copy(BASE_CAMERA);
    camera.lookAt(0, 0, 0);
    controls.current.update();
  }, [action, camera, controls]);
  return null;
}

function BrainModel({ scene, manifest, mode }: { scene: THREE.Group; manifest: NeuroManifest; mode: NeuroMode }) {
  const model = useMemo(() => {
    const clone = cloneMeshes(scene);
    const structures = mode === 'nervous-system'
      ? manifest.structures.filter((item) => item.category !== 'cranial_nerves')
      : manifest.structures;
    setNeuroMeshIds(clone, structures, 'brain', mode === 'nervous-system' ? 'neuro:system:brain' : '');
    if (mode === 'brain-atlas') {
      clone.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.userData.neuroLayerId = `neuro:brain:${object.userData.neuroCategory}`;
          if (object.userData.neuroCategory === 'cranial_nerves') object.visible = false;
        }
      });
      normalizeGroup(clone, 3, (object) => object.userData.neuroCategory !== 'cranial_nerves');
    }
    return clone;
  }, [scene, manifest, mode]);
  const state = useAppStore();
  useEffect(() => {
    applyModelState(model, mode, state.selectedNeuroStructures, state.hiddenNeuroStructures, state.hiddenNeuroLayers, state.neuroLayerOpacity, state.neuroIsolationMode);
  }, [model, mode, state.selectedNeuroStructures, state.hiddenNeuroStructures, state.hiddenNeuroLayers, state.neuroLayerOpacity, state.neuroIsolationMode]);
  useEffect(() => { state.setNeuroStatus('ready'); }, [state.setNeuroStatus]);
  return <primitive object={model} onClick={(event: { stopPropagation: () => void; object: THREE.Object3D }) => {
    event.stopPropagation();
    const id = event.object.userData.neuroStructureId as string | undefined;
    if (id) state.toggleNeuroStructure(id);
  }} />;
}

function NervousSystemModel({ brainScene, nerveScene, brainManifest, nervesManifest }: {
  brainScene: THREE.Group;
  nerveScene: THREE.Group;
  brainManifest: NeuroManifest;
  nervesManifest: NeuroManifest;
}) {
  const model = useMemo(() => {
    const root = new THREE.Group();
    const brain = cloneMeshes(brainScene);
    const nerves = cloneMeshes(nerveScene);
    setNeuroMeshIds(brain, brainManifest.structures.filter((item) => item.category !== 'cranial_nerves'), 'brain', 'neuro:system:brain');
    setNeuroMeshIds(nerves, nervesManifest.structures, 'nerves', 'neuro:system:nerves');
    root.add(brain, nerves);
    normalizeGroup(root);
    return root;
  }, [brainScene, nerveScene, brainManifest, nervesManifest]);
  const state = useAppStore();
  useEffect(() => {
    applyModelState(model, 'nervous-system', state.selectedNeuroStructures, state.hiddenNeuroStructures, state.hiddenNeuroLayers, state.neuroLayerOpacity, state.neuroIsolationMode);
  }, [model, state.selectedNeuroStructures, state.hiddenNeuroStructures, state.hiddenNeuroLayers, state.neuroLayerOpacity, state.neuroIsolationMode]);
  useEffect(() => { state.setNeuroStatus('ready'); }, [state.setNeuroStatus]);
  return <primitive object={model} onClick={(event: { stopPropagation: () => void; object: THREE.Object3D }) => {
    event.stopPropagation();
    const id = event.object.userData.neuroStructureId as string | undefined;
    if (id) state.toggleNeuroStructure(id);
  }} />;
}

function ModelBoundary({ children, onError }: React.PropsWithChildren<{ onError: () => void }>) {
  return <ErrorBoundary onError={onError}>{children}</ErrorBoundary>;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{ onError: () => void }>, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function BrainOnly({ manifest }: { manifest: NeuroManifest }) {
  const { scene } = useGLTF(NEURO_ASSETS.brain, '/draco/gltf/');
  return <BrainModel scene={scene} manifest={manifest} mode="brain-atlas" />;
}

function NervousSystem({ brainManifest, nervesManifest }: { brainManifest: NeuroManifest; nervesManifest: NeuroManifest }) {
  const { scene: brainScene } = useGLTF(NEURO_ASSETS.brain, '/draco/gltf/');
  const { scene: nerveScene } = useGLTF(NEURO_ASSETS.nerves, '/draco/gltf/');
  return <NervousSystemModel brainScene={brainScene} nerveScene={nerveScene} brainManifest={brainManifest} nervesManifest={nervesManifest} />;
}

const NeuroViewport3D: React.FC<{ active: boolean }> = ({ active }) => {
  const controls = useRef<OrbitControlsImpl>(null);
  const model = useRef<THREE.Group>(null);
  const { neuroMode, neuroBrainManifest, neuroNervesManifest, neuroStatus, neuroLoadRequest, neuroCameraAction, retryNeuroLoad, setNeuroStatus, isRotating } = useAppStore();
  const onError = () => setNeuroStatus('error', 'The local neuro anatomy model could not be loaded. Check the bundled model and retry.');

  useEffect(() => {
    if (neuroLoadRequest) {
      useGLTF.clear(NEURO_ASSETS.brain);
      useGLTF.clear(NEURO_ASSETS.nerves);
    }
  }, [neuroLoadRequest]);

  return <div className={styles.viewport} data-testid="neuro-3d-viewport" data-model-state={neuroStatus} data-model-mode={neuroMode}>
    <div className={styles.attribution}>Brain Project / Z-Anatomy · CC BY-SA 4.0</div>
    <div className={styles.assetCount}>{neuroMode === 'brain-atlas' ? `${neuroBrainManifest?.structures.length ?? 0} brain structures` : neuroMode === 'nervous-system' ? `${neuroNervesManifest?.structures.length ?? 0} nerve structures · spinal cord unavailable` : 'Neuron Lab integration pending'}</div>
    <Canvas frameloop={active ? (isRotating ? 'always' : 'demand') : 'never'} camera={{ position: [0, 0.15, 5.5], fov: 36, near: 0.01, far: 100 }} dpr={[1, 1.5]} onPointerMissed={() => useAppStore.getState().clearNeuroSelection()}>
      <color attach="background" args={['#080d10']} />
      <hemisphereLight args={['#d7f3ff', '#171f23', 1.8]} />
      <directionalLight position={[3, 6, 6]} intensity={2.2} />
      <directionalLight position={[-4, 2, -4]} intensity={1.4} color="#668cff" />
      <FitCamera controls={controls} action={neuroCameraAction} mode={neuroMode} model={model} />
      <group ref={model}>
      <ModelBoundary key={`${neuroMode}-${neuroLoadRequest}`} onError={onError}>
        <Suspense fallback={null}>
          {neuroMode === 'nervous-system' && neuroBrainManifest && neuroNervesManifest
            ? <NervousSystem brainManifest={neuroBrainManifest} nervesManifest={neuroNervesManifest} />
            : neuroMode === 'brain-atlas' && neuroBrainManifest
              ? <BrainOnly manifest={neuroBrainManifest} />
              : null}
        </Suspense>
      </ModelBoundary>
      </group>
      <AdaptiveDpr />
      <OrbitControls ref={controls} enablePan enableZoom enableRotate enableDamping dampingFactor={0.12} rotateSpeed={0.65} zoomSpeed={0.75} panSpeed={0.7} regress minDistance={0.35} maxDistance={20} autoRotate={active && isRotating} autoRotateSpeed={0.35} makeDefault />
    </Canvas>
    {(neuroStatus === 'idle' || neuroStatus === 'loading') && <div className={styles.modelOverlay}><div className={styles.loading}>Loading neuro atlas…</div></div>}
    {neuroStatus === 'error' && <div className={styles.modelOverlay}><div className={styles.loadError} role="alert">Neuro atlas failed to load. <button type="button" onClick={retryNeuroLoad}>Retry</button></div></div>}
    {neuroMode === 'neuron-lab' && <div className={styles.modelOverlay}><div className={styles.loading} role="status">Neuron Lab is reserved for integration of your separate Neuron branch.</div></div>}
    <div className={styles.hint}>DRAG TO ROTATE · SCROLL TO ZOOM · SHIFT + DRAG TO PAN</div>
  </div>;
};

export default NeuroViewport3D;
