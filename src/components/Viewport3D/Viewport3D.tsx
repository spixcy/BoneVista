import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Grid, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Download } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { MUSCLE_ATLAS_URL, normalizeMuscleAtlasModel, musclePresetIncludes } from '../../data/muscleAtlas';
import styles from './Viewport3D.module.css';

function normalize(name = '') { return name.toLowerCase().replace(/[^a-z0-9]/g, ''); }

const AtlasModel: React.FC<{ controls: React.RefObject<OrbitControlsImpl | null>; onReady: (model: THREE.Group) => void }> = ({ controls, onReady }) => {
  const { scene } = useGLTF('/anatomy/skeletal_male.glb', '/draco/gltf/');
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = object as THREE.Mesh;
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map((material) => material.clone()) : mesh.material.clone();
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    clone.position.sub(center);
    clone.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));
    return clone;
  }, [scene]);
  const { anatomyStructures, selectedBones, hiddenBones, isolationMode, toggleBoneSelection, isRotating, anatomicalView, viewMode, stressTargetId, stressResultMPa } = useAppStore();
  useEffect(() => onReady(model), [model, onReady]);
  const selectedId = Array.from(selectedBones).pop() ?? null;
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const byNode = useMemo(() => new Map(anatomyStructures.map((item) => [normalize(item.node), item])), [anatomyStructures]);
  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const item = byNode.get(normalize(object.name));
      const id = item?.organ_id;
      object.userData.organId = id;
      object.userData.structureName = item?.name_en;
      object.visible = !id || (!hiddenBones.has(id) && (!isolationMode || selectedBones.has(id)));
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const isStressTarget = viewMode === 'stress' && stressResultMPa !== null && id === stressTargetId;
      const stressColor = isStressTarget
        ? new THREE.Color('#2864d7').lerp(new THREE.Color('#ed493b'), Math.max(0, Math.min(1, stressResultMPa / 10)))
        : null;
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.color.set(stressColor ?? (id && selectedBones.has(id) ? '#668cff' : '#d4d3c8'));
          material.emissive.set(isStressTarget && stressColor ? stressColor.clone().multiplyScalar(0.18) : id && selectedBones.has(id) ? '#182b68' : '#000000');
          material.roughness = 0.78;
          material.metalness = 0.02;
        }
      });
    });
  }, [model, byNode, selectedBones, hiddenBones, isolationMode, viewMode, stressTargetId, stressResultMPa]);

  useEffect(() => {
    if (!selectedId || !controls.current) return;
    let selected: THREE.Object3D | null = null;
    model.traverse((object) => { if (object.userData.organId === selectedId) selected = object; });
    if (!selected) return;
    const bounds = new THREE.Box3().setFromObject(selected);
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = Math.max(...bounds.getSize(new THREE.Vector3()).toArray()) * 5 + 0.15;
    const direction = camera.position.clone().sub(controls.current.target).normalize();
    controls.current.target.copy(center);
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    controls.current.update();
  }, [selectedId, model, camera, controls]);

  useEffect(() => {
    if (!controls.current) return;
    const target = controls.current.target.clone();
    const distance = Math.max(camera.position.distanceTo(target), 4);
    const direction: Record<string, THREE.Vector3> = {
      anterior: new THREE.Vector3(0, 0, 1), posterior: new THREE.Vector3(0, 0, -1),
      'lateral-l': new THREE.Vector3(-1, 0, 0), 'lateral-r': new THREE.Vector3(1, 0, 0),
      superior: new THREE.Vector3(0, 1, 0), inferior: new THREE.Vector3(0, -1, 0),
    };
    camera.position.copy(target.clone().add(direction[anatomicalView].multiplyScalar(distance)));
    camera.up.set(0, anatomicalView === 'superior' || anatomicalView === 'inferior' ? 0 : 1, anatomicalView === 'superior' ? -1 : 1);
    camera.lookAt(target);
    controls.current.update();
  }, [anatomicalView, camera, controls]);

  useFrame((_, delta) => { if (isRotating && group.current) group.current.rotation.y += delta * 0.35; });

  return <group ref={group} onClick={(event) => {
    event.stopPropagation();
    const id = event.object.userData.organId as string | undefined;
    if (id) toggleBoneSelection(id);
  }}><primitive object={model} /></group>;
};

const MuscleAtlasModel: React.FC<{ controls: React.RefObject<OrbitControlsImpl | null>; onReady: (model: THREE.Group) => void }> = ({ controls, onReady }) => {
  const { scene } = useGLTF(MUSCLE_ATLAS_URL);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = Array.isArray(object.material) ? object.material.map((material) => material.clone()) : object.material.clone();
      object.castShadow = true;
      object.receiveShadow = true;
    });
    normalizeMuscleAtlasModel(clone);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    clone.position.sub(center);
    clone.scale.multiplyScalar(3 / Math.max(size.x, size.y, size.z));
    return clone;
  }, [scene]);
  const { muscleStructures, musclePreset, selectedBones, hiddenBones, isolationMode, toggleBoneSelection, isRotating, anatomicalView } = useAppStore();
  const selectedId = muscleStructures.find((item) => selectedBones.has(item.id))?.id ?? null;
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => onReady(model), [model, onReady]);

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const id = object.userData.muscleStructureId as string | undefined;
      const structure = muscleStructures.find((item) => item.id === id);
      object.visible = !!structure && musclePresetIncludes(musclePreset, structure)
        && !hiddenBones.has(id!) && (!isolationMode || selectedBones.has(id!));
      const selected = !!id && selectedBones.has(id);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.emissive.set(selected ? '#182b68' : '#000000');
          material.emissiveIntensity = selected ? 0.8 : 1;
        }
      });
    });
  }, [model, muscleStructures, musclePreset, selectedBones, hiddenBones, isolationMode]);

  useEffect(() => {
    if (!selectedId || !controls.current) return;
    let selected: THREE.Object3D | null = null;
    model.traverse((object) => { if (object.userData.muscleStructureId === selectedId) selected = object; });
    if (!selected) return;
    const bounds = new THREE.Box3().setFromObject(selected);
    const center = bounds.getCenter(new THREE.Vector3());
    const distance = Math.max(...bounds.getSize(new THREE.Vector3()).toArray()) * 5 + 0.15;
    const direction = camera.position.clone().sub(controls.current.target).normalize();
    controls.current.target.copy(center);
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    controls.current.update();
  }, [selectedId, model, camera, controls]);

  useEffect(() => {
    if (!controls.current) return;
    const target = controls.current.target.clone();
    const distance = Math.max(camera.position.distanceTo(target), 4);
    const direction: Record<string, THREE.Vector3> = {
      anterior: new THREE.Vector3(0, 0, 1), posterior: new THREE.Vector3(0, 0, -1),
      'lateral-l': new THREE.Vector3(-1, 0, 0), 'lateral-r': new THREE.Vector3(1, 0, 0),
      superior: new THREE.Vector3(0, 1, 0), inferior: new THREE.Vector3(0, -1, 0),
    };
    camera.position.copy(target.clone().add(direction[anatomicalView].multiplyScalar(distance)));
    camera.up.set(0, anatomicalView === 'superior' || anatomicalView === 'inferior' ? 0 : 1, anatomicalView === 'superior' ? -1 : 1);
    camera.lookAt(target);
    controls.current.update();
  }, [anatomicalView, camera, controls]);

  useFrame((_, delta) => { if (isRotating && group.current) group.current.rotation.y += delta * 0.35; });

  return <group ref={group} onClick={(event) => {
    event.stopPropagation();
    const id = event.object.userData.muscleStructureId as string | undefined;
    if (id) toggleBoneSelection(id);
  }}><primitive object={model} /></group>;
};

class ModelBoundary extends React.Component<React.PropsWithChildren<{ onError: () => void }>, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const Viewport3D: React.FC<{ active: boolean }> = ({ active }) => {
  const controls = useRef<OrbitControlsImpl>(null);
  const exportModel = useRef<THREE.Group | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState(false);
  const onModelReady = useCallback((model: THREE.Group) => { exportModel.current = model; setModelLoaded(true); setModelError(false); }, []);
  const { clearBoneSelection, anatomyStructures, muscleStructures, activePage, musclePreset, muscleStatus, muscleLoadRequest, isRotating, setMuscleStructures, setMuscleStatus, setMuscleError } = useAppStore();
  const musclePage = activePage === 'muscles';
  const showMuscleModel = musclePage && musclePreset !== 'bones';
  const [muscleLoadAttempt, setMuscleLoadAttempt] = useState(0);

  useEffect(() => {
    setModelLoaded(false);
    setModelError(false);
    if (showMuscleModel) {
      setMuscleError(null);
      setMuscleStatus('loading');
    }
  }, [showMuscleModel, muscleLoadAttempt, setMuscleError, setMuscleStatus]);

  useEffect(() => {
    if (muscleLoadRequest === 0) return;
    useGLTF.clear(MUSCLE_ATLAS_URL);
    setMuscleLoadAttempt((attempt) => attempt + 1);
  }, [muscleLoadRequest]);

  const onMuscleModelReady = useCallback((model: THREE.Group) => {
    const normalized = normalizeMuscleAtlasModel(model);
    setMuscleStructures(normalized.structures);
    setMuscleStatus('ready');
    onModelReady(model);
  }, [onModelReady, setMuscleStatus, setMuscleStructures]);

  const setLoadError = useCallback(() => {
    if (showMuscleModel) {
      setMuscleError('The Écorché anatomy model could not be loaded. Check the local asset and retry.');
    } else {
      setModelError(true);
    }
  }, [showMuscleModel, setMuscleError]);

  const visibleStructureCount = showMuscleModel
    ? muscleStructures.filter((item) => musclePresetIncludes(musclePreset, item)).length
    : anatomyStructures.length;

  return (
    <div className={styles.viewport}>
      <div className={styles.attribution}>Reference anatomy · Z-Anatomy / BodyParts3D · CC BY-SA 4.0</div>
      <div className={styles.assetCount}>{visibleStructureCount || '—'} named structures</div>
      <Canvas frameloop={active ? (isRotating ? 'always' : 'demand') : 'never'} camera={{ position: [0, 0.4, 5.7], fov: 36, near: 0.01, far: 100 }} dpr={[1, 1.5]} onPointerMissed={clearBoneSelection}>
        <color attach="background" args={['#080d10']} />
        <hemisphereLight args={['#d7f3ff', '#171f23', 1.8]} />
        <directionalLight position={[3, 6, 6]} intensity={2.2} />
        <directionalLight position={[-4, 2, -4]} intensity={1.4} color="#668cff" />
        <Grid position={[0, -1.8, 0]} args={[12, 12]} cellSize={0.4} cellThickness={0.4} cellColor="#163231" sectionColor="#214440" fadeDistance={12} fadeStrength={2} infiniteGrid />
        <ModelBoundary key={`${showMuscleModel ? 'ecorche' : 'bonevista'}-${muscleLoadAttempt}`} onError={setLoadError}>
          <Suspense fallback={null}>
            {showMuscleModel
              ? <MuscleAtlasModel controls={controls} onReady={onMuscleModelReady} />
              : <AtlasModel controls={controls} onReady={onModelReady} />}
          </Suspense>
        </ModelBoundary>
        <AdaptiveDpr />
        <OrbitControls ref={controls} enablePan enableZoom enableRotate enableDamping dampingFactor={0.12} rotateSpeed={0.65} zoomSpeed={0.75} panSpeed={0.7} regress minDistance={0.7} maxDistance={15} makeDefault />
      </Canvas>
      {!modelLoaded && !(showMuscleModel ? muscleStatus === 'error' : modelError) && <div className={styles.modelOverlay}><div className={styles.loading}>{showMuscleModel ? 'Loading muscle atlas…' : 'Loading segmented atlas…'}</div></div>}
      {!showMuscleModel && modelError && <div className={`${styles.modelOverlay} ${styles.loadError}`} role="alert">Anatomy atlas failed to load. Refresh to retry.</div>}
      <div className={styles.exports}>
        <button onClick={() => exportGLB(exportModel.current, showMuscleModel ? 'bonevista-muscle-atlas.glb' : 'bonevista-reference-skeleton.glb')} disabled={!modelLoaded} aria-label="Export GLB"><Download size={13}/> GLB</button>
        <button onClick={() => exportOBJ(exportModel.current, showMuscleModel ? 'bonevista-muscle-atlas.obj' : 'bonevista-reference-skeleton.obj')} disabled={!modelLoaded} aria-label="Export OBJ"><Download size={13}/> OBJ</button>
        <button onClick={() => showMuscleModel
          ? exportMuscleSummary(muscleStructures, useAppStore.getState().selectedBones)
          : exportSummary(anatomyStructures, useAppStore.getState().selectedBones)}
          disabled={showMuscleModel ? !muscleStructures.length : !anatomyStructures.length} aria-label="Export PDF summary"><Download size={13}/> PDF</button>
      </div>
      <div className={styles.hint}>DRAG TO ROTATE · SCROLL TO ZOOM · SHIFT + DRAG TO PAN</div>
    </div>
  );
};

export default Viewport3D;

function saveFile(data: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function exportGLB(model: THREE.Group | null, filename: string) {
  if (!model) return;
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
  new GLTFExporter().parse(model, (result) => saveFile(result as ArrayBuffer, 'model/gltf-binary', filename), (error) => console.error('GLB export failed', error), { binary: true });
}
async function exportOBJ(model: THREE.Group | null, filename: string) {
  if (!model) return;
  const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
  saveFile(new OBJExporter().parse(model), 'text/plain', filename);
}
async function exportSummary(structures: import('../../store/appStore').AnatomyStructure[], selected: Set<string>) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  pdf.setFontSize(18); pdf.text('BoneVista — Reference Atlas Summary', 16, 20);
  pdf.setFontSize(10); pdf.text('Generalized reference anatomy. No patient-specific interpretation.', 16, 29);
  pdf.text(`Atlas structures: ${structures.length}`, 16, 40);
  pdf.text(`Selected structures: ${selected.size}`, 16, 47);
  let y = 60;
  structures.filter((item) => selected.has(item.organ_id)).forEach((item) => {
    if (y > 275) { pdf.addPage(); y = 20; }
    pdf.text(`${item.name_en} — ${item.ta2_latin}`, 16, y);
    y += 7;
  });
  pdf.save('bonevista-reference-summary.pdf');
}

async function exportMuscleSummary(structures: import('../../store/appStore').MuscleAtlasStructure[], selected: Set<string>) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  const selectedStructures = structures.filter((item) => selected.has(item.id));
  pdf.setFontSize(18); pdf.text('BoneVista — Écorché Reference Atlas Summary', 16, 20);
  pdf.setFontSize(10); pdf.text('Generalized reference anatomy. No patient-specific interpretation.', 16, 29);
  pdf.text(`Loaded structures: ${structures.length}`, 16, 40);
  pdf.text(`Selected structures: ${selectedStructures.length}`, 16, 47);
  let y = 60;
  selectedStructures.forEach((item) => {
    if (y > 275) { pdf.addPage(); y = 20; }
    pdf.text(`${item.name} — ${item.fmaId ?? item.id} (${item.side})`, 16, y);
    y += 7;
  });
  pdf.save('bonevista-muscle-atlas-summary.pdf');
}







