export interface VertebraInfo {
  id: string;
  label: string;
  region: 'cervical' | 'thoracic' | 'lumbar' | 'sacral' | 'coccygeal';
  selectable: boolean; // depends on whether the GLB has a named mesh
  description: string;
}

export interface BoneGroup {
  id: string;
  name: string;
  region: string;
  subBones?: string[];
  color: string;
  description: string;
}

export const vertebrae: VertebraInfo[] = [
  // Cervical
  { id: 'C1', label: 'C1 (Atlas)',  region: 'cervical',  selectable: true,  description: 'Supports the skull; no vertebral body.' },
  { id: 'C2', label: 'C2 (Axis)',   region: 'cervical',  selectable: true,  description: 'Has the dens; allows head rotation.' },
  { id: 'C3', label: 'C3',          region: 'cervical',  selectable: true,  description: 'Mid-cervical vertebra.' },
  { id: 'C4', label: 'C4',          region: 'cervical',  selectable: true,  description: 'Mid-cervical vertebra.' },
  { id: 'C5', label: 'C5',          region: 'cervical',  selectable: true,  description: 'Mid-cervical vertebra.' },
  { id: 'C6', label: 'C6',          region: 'cervical',  selectable: true,  description: 'Lower cervical; prominent transverse foramen.' },
  { id: 'C7', label: 'C7 (Vertebra Prominens)', region: 'cervical', selectable: true, description: 'Largest cervical spinous process.' },
  // Thoracic
  { id: 'T1',  label: 'T1',  region: 'thoracic', selectable: true,  description: 'Articulates with first rib.' },
  { id: 'T2',  label: 'T2',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T3',  label: 'T3',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T4',  label: 'T4',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T5',  label: 'T5',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T6',  label: 'T6',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T7',  label: 'T7',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T8',  label: 'T8',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T9',  label: 'T9',  region: 'thoracic', selectable: true,  description: '' },
  { id: 'T10', label: 'T10', region: 'thoracic', selectable: true,  description: '' },
  { id: 'T11', label: 'T11', region: 'thoracic', selectable: true,  description: '' },
  { id: 'T12', label: 'T12', region: 'thoracic', selectable: true,  description: 'Last thoracic; articulates with L1.' },
  // Lumbar
  { id: 'L1', label: 'L1', region: 'lumbar', selectable: true, description: 'Largest vertebrae for weight bearing.' },
  { id: 'L2', label: 'L2', region: 'lumbar', selectable: true, description: '' },
  { id: 'L3', label: 'L3', region: 'lumbar', selectable: true, description: '' },
  { id: 'L4', label: 'L4', region: 'lumbar', selectable: true, description: 'Common disc herniation site.' },
  { id: 'L5', label: 'L5', region: 'lumbar', selectable: true, description: 'Articulates with sacrum at lumbosacral junction.' },
  // Sacral / coccygeal
  { id: 'S1-S5', label: 'Sacrum (S1–S5)', region: 'sacral',   selectable: true,  description: 'Fused sacral segments; key weight-bearing structure.' },
  { id: 'Co',    label: 'Coccyx',         region: 'coccygeal', selectable: false, description: 'Fused vestigial tail vertebrae; not individually selectable in most models.' },
];

export const boneGroups: BoneGroup[] = [
  { id: 'skull',       name: 'Skull',         region: 'cranial',   color: '#c4a882', description: 'Cranium and facial bones.' },
  { id: 'mandible',    name: 'Mandible',       region: 'cranial',   color: '#c4a882', description: 'Lower jaw, movable bone of the skull.' },
  { id: 'clavicle-l',  name: 'Clavicle (L)',   region: 'pectoral',  color: '#a0c4ff', description: 'Collarbone, left.' },
  { id: 'clavicle-r',  name: 'Clavicle (R)',   region: 'pectoral',  color: '#a0c4ff', description: 'Collarbone, right.' },
  { id: 'scapula-l',   name: 'Scapula (L)',    region: 'pectoral',  color: '#a0c4ff', description: 'Shoulder blade, left.' },
  { id: 'scapula-r',   name: 'Scapula (R)',    region: 'pectoral',  color: '#a0c4ff', description: 'Shoulder blade, right.' },
  { id: 'sternum',     name: 'Sternum',        region: 'thoracic',  color: '#b5ead7', description: 'Breastbone; articulates with ribs and clavicles.' },
  { id: 'ribs',        name: 'Rib Cage',       region: 'thoracic',  color: '#b5ead7', description: '12 pairs; protects heart and lungs.' },
  { id: 'spine',       name: 'Vertebral Column', region: 'spinal',  color: '#ffd6a5', description: '33 vertebrae; see Spine Explorer for detail.' },
  { id: 'pelvis',      name: 'Pelvis',         region: 'pelvic',    color: '#c9b1ff', description: 'Hip bones (ilium, ischium, pubis) + sacrum.' },
  { id: 'humerus-l',   name: 'Humerus (L)',    region: 'upper-limb', color: '#ffb4b4', description: 'Upper arm bone, left.' },
  { id: 'humerus-r',   name: 'Humerus (R)',    region: 'upper-limb', color: '#ffb4b4', description: 'Upper arm bone, right.' },
  { id: 'radius-l',    name: 'Radius (L)',     region: 'upper-limb', color: '#ffb4b4', description: '' },
  { id: 'radius-r',    name: 'Radius (R)',     region: 'upper-limb', color: '#ffb4b4', description: '' },
  { id: 'ulna-l',      name: 'Ulna (L)',       region: 'upper-limb', color: '#ffb4b4', description: '' },
  { id: 'ulna-r',      name: 'Ulna (R)',       region: 'upper-limb', color: '#ffb4b4', description: '' },
  { id: 'femur-l',     name: 'Femur (L)',      region: 'lower-limb', color: '#caffbf', description: 'Longest bone in the body, left.' },
  { id: 'femur-r',     name: 'Femur (R)',      region: 'lower-limb', color: '#caffbf', description: 'Longest bone in the body, right.' },
  { id: 'tibia-l',     name: 'Tibia (L)',      region: 'lower-limb', color: '#caffbf', description: '' },
  { id: 'tibia-r',     name: 'Tibia (R)',      region: 'lower-limb', color: '#caffbf', description: '' },
  { id: 'fibula-l',    name: 'Fibula (L)',     region: 'lower-limb', color: '#caffbf', description: '' },
  { id: 'fibula-r',    name: 'Fibula (R)',     region: 'lower-limb', color: '#caffbf', description: '' },
  { id: 'patella-l',   name: 'Patella (L)',    region: 'lower-limb', color: '#caffbf', description: 'Kneecap, left.' },
  { id: 'patella-r',   name: 'Patella (R)',    region: 'lower-limb', color: '#caffbf', description: 'Kneecap, right.' },
];
