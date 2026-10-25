import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, type AnatomyStructure } from '../../store/appStore';
import { BONE, CARTILAGE, Label, Sway, type Vec3 } from './sceneKit';

// Real bones from the reference atlas used across BoneVista.
const ATLAS_URL = '/anatomy/skeletal_male.glb';
const DRACO_URL = '/draco/gltf/';

// The loader strips spaces and dots from node names, so compare a normalised form.
const norm = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const AXIAL_GROUPS = new Set(['Vertebral column', 'Thoracic skeleton', 'Axial skeleton', 'Cranium', 'Extracranial bones of head', 'Skeletal system']);
const isCartilage = (name: string) => /cartilage|disc/i.test(name);

function findNode(root: THREE.Object3D, name: string) {
  const key = norm(name);
  let hit: THREE.Object3D | null = null;
  root.traverse((object) => { if (!hit && norm(object.name) === key) hit = object; });
  return hit as THREE.Object3D | null;
}

/** Copies one named bone out of the atlas, keeping its world transform. */
function extractBone(scene: THREE.Object3D, name: string, material: THREE.Material) {
  scene.updateMatrixWorld(true);
  const node = findNode(scene, name);
  if (!node) return null;
  const copy = node.clone(true);
  node.matrixWorld.decompose(copy.position, copy.quaternion, copy.scale);
  copy.traverse((object) => {
    object.visible = true;
    if (object instanceof THREE.Mesh) object.material = material;
  });
  copy.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(copy);
  return { object: copy, center: box.getCenter(new THREE.Vector3()), size: Math.max(...box.getSize(new THREE.Vector3()).toArray()) || 1 };
}

/** Maps every mesh in a cloned atlas to the manifest entry of the named bone that owns it. */
function ownersOf(model: THREE.Object3D, structures: AnatomyStructure[]) {
  const byNode = new Map(structures.map((item) => [norm(item.node), item]));
  const owners = new Map<THREE.Mesh, AnatomyStructure | null>();
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    let owner: AnatomyStructure | null = null;
    for (let node: THREE.Object3D | null = object; node && !owner; node = node.parent) owner = byNode.get(norm(node.name)) ?? null;
    owners.set(object, owner);
  });
  return owners;
}

const useBoneMaterial = () => {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: BONE, roughness: 0.7, metalness: 0.03 }), []);
  useEffect(() => () => material.dispose(), [material]);
  return material;
};

/* ─── Bone shapes ────────────────────────────────────── */

const SHAPES: { name: string; label: string; size: number; position: Vec3 }[] = [
  { name: 'Femur.r', label: 'Long · femur', size: 2.7, position: [-1.55, 0.05, 0] },
  { name: 'Capitate bone.r', label: 'Short · capitate', size: 0.75, position: [0.35, 0.85, 0] },
  { name: 'Parietal bone.l', label: 'Flat · parietal', size: 1.25, position: [1.8, 0.85, 0] },
  { name: 'Vertebra L3', label: 'Irregular · L3 vertebra', size: 1.0, position: [0.35, -0.75, 0] },
  { name: 'Patella.r', label: 'Sesamoid · patella', size: 0.75, position: [1.8, -0.75, 0] },
];

const SpinningBone: React.FC<{ name: string; size: number; position: Vec3; label: string; phase: number }> = ({ name, size, position, label, phase }) => {
  const { scene } = useGLTF(ATLAS_URL, DRACO_URL);
  const material = useBoneMaterial();
  const bone = useMemo(() => extractBone(scene, name, material), [scene, name, material]);
  const spin = useRef<THREE.Group>(null);
  useFrame((state) => { if (spin.current) spin.current.rotation.y = phase + state.clock.elapsedTime * 0.45; });
  if (!bone) return null;
  const labelY = name.startsWith('Femur') ? -1.55 : -0.62;
  return (
    <group position={position}>
      <group ref={spin}>
        <group scale={size / bone.size}>
          <group position={bone.center.clone().multiplyScalar(-1)}><primitive object={bone.object} /></group>
        </group>
      </group>
      <Label position={[0, labelY, 0]} center>{label}</Label>
    </group>
  );
};

export const BoneShapes: React.FC = () => (
  <group>
    {SHAPES.map((shape, i) => <SpinningBone key={shape.name} {...shape} phase={i * 1.3} />)}
  </group>
);

/* ─── Whole skeleton: regions and fracture sites ─────── */

const REGION_LABELS: { text: string; nodes: string[]; left?: boolean; at?: 'top' | 'center' }[] = [
  { text: 'Skull · 22', nodes: ['Parietal bone.r'], left: true },
  { text: 'Thoracic cage · 25', nodes: ['Body of sternum'], left: true },
  { text: 'Vertebral column · 26', nodes: ['Vertebra L3'], left: true },
  { text: 'Pectoral girdle · 4', nodes: ['Clavicle.l'] },
  { text: 'Upper limbs · 60', nodes: ['Humerus.l'] },
  { text: 'Pelvic girdle · 2', nodes: ['Hip bone.l'] },
  { text: 'Lower limbs · 60', nodes: ['Tibia.l'] },
];

const FRACTURE_SITES: { text: string; nodes: string[]; left?: boolean; dy?: number; at: 'top' | 'bottom' | 'center' }[] = [
  { text: 'Clavicle · middle third', nodes: ['Clavicle.r'], left: true, at: 'center' },
  { text: 'Vertebral compression · T12–L1', nodes: ['Vertebra T12', 'Vertebra L1'], left: true, at: 'center' },
  { text: 'Scaphoid', nodes: ['Scaphoid bone.r'], left: true, at: 'center' },
  { text: 'Distal radius (Colles)', nodes: ['Radius.l'], at: 'bottom', dy: -22 },
  { text: 'Hip · femoral neck', nodes: ['Femur.l'], at: 'top', dy: 22 },
];

const HIGHLIGHT = new THREE.Color('#d9573f');

export const Skeleton: React.FC<{ mode: 'regions' | 'fractures' }> = ({ mode }) => {
  const { scene } = useGLTF(ATLAS_URL, DRACO_URL);
  const structures = useAppStore((state) => state.anatomyStructures);
  const pulse = useRef<THREE.MeshStandardMaterial | null>(null);

  const built = useMemo(() => {
    const model = scene.clone(true);
    const owners = ownersOf(model, structures);
    const materials = {
      bone: new THREE.MeshStandardMaterial({ color: BONE, roughness: 0.7, metalness: 0.03 }),
      dim: new THREE.MeshStandardMaterial({ color: '#9d9686', roughness: 0.85 }),
      axial: new THREE.MeshStandardMaterial({ color: '#d9b45a', roughness: 0.45, metalness: 0.25 }),
      cartilage: new THREE.MeshStandardMaterial({ color: CARTILAGE, roughness: 0.4, transparent: true, opacity: 0.8 }),
      highlight: new THREE.MeshStandardMaterial({ color: HIGHLIGHT, emissive: HIGHLIGHT, emissiveIntensity: 0.25, roughness: 0.5 }),
    };
    const sites = mode === 'fractures' ? FRACTURE_SITES : REGION_LABELS;
    const highlighted = new Set(mode === 'fractures' ? FRACTURE_SITES.flatMap((site) => site.nodes.map(norm)) : []);
    owners.forEach((owner, mesh) => {
      mesh.visible = true;
      const name = owner?.node ?? mesh.name;
      if (isCartilage(name)) mesh.material = materials.cartilage;
      else if (mode === 'fractures') mesh.material = owner && highlighted.has(norm(owner.node)) ? materials.highlight : materials.dim;
      else mesh.material = owner && AXIAL_GROUPS.has(owner.path[0]) ? materials.axial : materials.bone;
    });
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const anchors = sites.map((site) => {
      const box = new THREE.Box3();
      site.nodes.forEach((name) => { const node = findNode(model, name); if (node) box.expandByObject(node); });
      if (box.isEmpty()) return null;
      const point = box.getCenter(new THREE.Vector3());
      const at = 'at' in site ? site.at : 'center';
      const height = box.max.y - box.min.y;
      if (at === 'top') point.y = box.max.y - height * 0.06;
      if (at === 'bottom') point.y = box.min.y + height * 0.08;
      return { ...site, point };
    }).filter((anchor) => anchor !== null);
    return { model, materials, anchors, center: bounds.getCenter(new THREE.Vector3()), height: bounds.max.y - bounds.min.y || 1 };
  }, [scene, structures, mode]);

  useEffect(() => { pulse.current = built.materials.highlight; }, [built]);
  useEffect(() => () => Object.values(built.materials).forEach((material) => material.dispose()), [built]);
  useFrame((state) => { if (pulse.current) pulse.current.emissiveIntensity = 0.2 + (Math.sin(state.clock.elapsedTime * 2.4) + 1) * 0.18; });

  return (
    <Sway amount={0.55} speed={0.2}>
      <group scale={4.5 / built.height}>
        <group position={built.center.clone().multiplyScalar(-1)}>
          <primitive object={built.model} />
          {built.anchors.map((anchor) => (
            <Label key={anchor.text} position={anchor.point.toArray() as Vec3} left={anchor.left} dy={'dy' in anchor ? anchor.dy : undefined}>{anchor.text}</Label>
          ))}
        </group>
      </group>
    </Sway>
  );
};
