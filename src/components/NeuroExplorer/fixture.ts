/**
 * BoneVista Neuro & Brain Explorer — Test / Demo Fixtures
 *
 * NOTE: For component unit tests and UI verification only.
 * Production data is loaded dynamically from manifest.json via neuroAtlasData.ts.
 * Meets requirements of docs/NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md.
 *
 * Owner: Antigravity Flash High
 */

import type { NeuroMode, NeuroStructureView, NeuroLayerView, NeuroExplorerViewProps } from './types';
import { DEFAULT_NEURO_LAYERS, NEURON_LAB_STRUCTURES } from './neuroAtlasData';

export const DEMO_NERVOUS_SYSTEM_STRUCTURES: NeuroStructureView[] = [
  {
    id: 'neuro:system:olfactory_nerve',
    name: 'Olfactory nerve (CN I)',
    latinName: 'Nervus olfactorius',
    category: 'Cranial Nerves (CN I–XII)',
    region: 'Cranial Nerves',
    side: 'midline',
    description: 'First cranial nerve mediating sense of smell. Sourced from reference anatomy.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:system:optic_nerve_l',
    name: 'Optic nerve (CN II, Left)',
    latinName: 'Nervus opticus sinister',
    category: 'Cranial Nerves (CN I–XII)',
    region: 'Cranial Nerves',
    side: 'left',
    description: 'Second cranial nerve transmitting visual information from retinal ganglion cells.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:system:vagus_nerve_l',
    name: 'Vagus nerve (CN X, Left)',
    latinName: 'Nervus vagus sinister',
    category: 'Cranial Nerves (CN I–XII)',
    region: 'Cranial Nerves',
    side: 'left',
    description: 'Tenth cranial nerve supplying parasympathetic innervation to thoracic and abdominal organs.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:system:spinal_cord',
    name: 'Spinal cord',
    latinName: 'Medulla spinalis',
    category: 'Spinal Cord & Segments',
    region: 'Central Nervous System',
    side: 'midline',
    description: 'Major conduit of motor and sensory information between brain and body.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:system:sciatic_nerve_r',
    name: 'Sciatic nerve (Right)',
    latinName: 'Nervus ischiadicus dexter',
    category: 'Spinal Nerves & Plexuses',
    region: 'Lower limb',
    side: 'right',
    description: 'Largest single nerve in the human body originating from lumbar and sacral segments (L4-S3).',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:system:sympathetic_trunk',
    name: 'Sympathetic trunk',
    latinName: 'Truncus sympathicus',
    category: 'Autonomic Nervous System',
    region: 'Autonomic division',
    side: 'midline',
    description: 'Fundamental component of the sympathetic division extending from base of skull to coccyx.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
];

export const DEMO_BRAIN_STRUCTURES: NeuroStructureView[] = [
  {
    id: 'neuro:brain:frontal_lobe_l',
    name: 'Frontal lobe (Left)',
    latinName: 'Lobus frontalis sinister',
    category: 'Cerebral Cortex & Lobes',
    region: 'Telencephalon / Frontal',
    side: 'left',
    description: 'Anterior cerebral lobe mediating executive functions, motor planning, and expressive speech.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:brain:cerebellum',
    name: 'Cerebellum',
    latinName: 'Cerebellum',
    category: 'Cerebellum',
    region: 'Metencephalon',
    side: 'midline',
    description: 'Infratentorial structure essential for motor control, coordination, precision, and timing.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:brain:pons',
    name: 'Pons',
    latinName: 'Pons',
    category: 'Brainstem',
    region: 'Metencephalon / Brainstem',
    side: 'midline',
    description: 'Brainstem region connecting cerebellum to medulla oblongata and midbrain.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:brain:lateral_ventricle_l',
    name: 'Lateral ventricle (Left)',
    latinName: 'Ventriculus lateralis sinister',
    category: 'Ventricular System',
    region: 'Ventricular system',
    side: 'left',
    description: 'C-shaped cavity within cerebral hemisphere containing choroid plexus for CSF production.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
  {
    id: 'neuro:brain:thalamus_r',
    name: 'Thalamus (Right)',
    latinName: 'Thalamus dexter',
    category: 'Diencephalon & Deep Nuclei',
    region: 'Diencephalon',
    side: 'right',
    description: 'Major sensory relay hub directing inputs to corresponding sensory cortical regions.',
    source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
    selectable: true,
  },
];

export function getDemoStructuresForMode(mode: NeuroMode): NeuroStructureView[] {
  switch (mode) {
    case 'nervous-system':
      return DEMO_NERVOUS_SYSTEM_STRUCTURES;
    case 'brain-atlas':
      return DEMO_BRAIN_STRUCTURES;
    case 'neuron-lab':
      return NEURON_LAB_STRUCTURES;
  }
}

export function createDemoNeuroUIProps(
  overrides?: Partial<NeuroExplorerViewProps>
): NeuroExplorerViewProps {
  const mode: NeuroMode = overrides?.activeMode || 'nervous-system';
  return {
    activeMode: mode,
    onModeChange: () => {},
    loading: false,
    searchQuery: '',
    onSearchChange: () => {},
    structures: getDemoStructuresForMode(mode),
    selectedIds: [getDemoStructuresForMode(mode)[0]?.id || ''],
    onToggleStructure: () => {},
    layers: DEFAULT_NEURO_LAYERS[mode],
    onToggleLayer: () => {},
    onLayerOpacityChange: () => {},
    onIsolateSelection: () => {},
    onClearSelection: () => {},
    onFocusSelection: () => {},
    onResetView: () => {},
    ...overrides,
  };
}
