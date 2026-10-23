/**
 * BoneVista Neuro & Brain Explorer — Data Provider & Normalizer
 *
 * Sourced from BoneVista's verified anatomy manifest (Z-Anatomy / BodyParts3D, CC BY-SA 4.0)
 * for Whole Nervous System and Brain Atlas, and an illustrative morphology fixture
 * for Neuron Lab (clearly labelled illustrative pending separate Neuron Lab branch).
 *
 * Owner: Antigravity Flash High (UI/presentation data adapter)
 * Core/mesh integration: Codex Luna High
 */

import type { NeuroMode, NeuroStructureView, NeuroLayerView } from './types';

// Default layers per mode
export const DEFAULT_NEURO_LAYERS: Record<NeuroMode, NeuroLayerView[]> = {
  'nervous-system': [
    { id: 'layer:system:cns', label: 'Central Nervous System (Brain & Cord)', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:system:cranial', label: 'Cranial Nerves (CN I–XII)', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:system:spinal', label: 'Spinal Nerves & Plexuses', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:system:autonomic', label: 'Autonomic Division / Sympathetic', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:system:sensory', label: 'Sensory Organs & Receptors', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:system:skeleton', label: 'Skeletal Reference Reference', available: false, visible: false, opacity: 0.3 },
  ],
  'brain-atlas': [
    { id: 'layer:brain:cortex', label: 'Cerebral Cortex & Lobes', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:brain:cerebellum', label: 'Cerebellum', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:brain:brainstem', label: 'Brainstem (Midbrain, Pons, Medulla)', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:brain:ventricles', label: 'Ventricular System & Aqueduct', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:brain:subcortical', label: 'Deep Nuclei & Diencephalon', available: true, visible: true, opacity: 1.0 },
  ],
  'neuron-lab': [
    { id: 'layer:neuron:soma', label: 'Soma & Cell Body', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:neuron:dendrites', label: 'Dendrites & Spines', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:neuron:axon', label: 'Axon & Axon Hillock', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:neuron:myelin', label: 'Myelin Sheath & Nodes', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:neuron:synapse', label: 'Synaptic Boutons & Terminals', available: true, visible: true, opacity: 1.0 },
    { id: 'layer:neuron:signal', label: 'Illustrative Signal Animation', available: true, visible: true, opacity: 1.0 },
  ],
};

// Illustrative Neuron Lab structures (clearly identified as synthetic/illustrative)
export const NEURON_LAB_STRUCTURES: NeuroStructureView[] = [
  {
    id: 'neuro:neuron:soma',
    name: 'Soma (Perikaryon)',
    latinName: 'Corpus neurale',
    category: 'Cell Body & Organelles',
    region: 'Cell Body',
    description: 'Central cell body containing the nucleus, Nissl substance, and metabolic machinery. Illustrative schematic.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:nucleus',
    name: 'Neuronal Nucleus & Nucleolus',
    latinName: 'Nucleus neuronii',
    category: 'Cell Body & Organelles',
    region: 'Cell Body',
    description: 'Houses genetic information and directs protein synthesis within the perikaryon. Illustrative schematic.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:apical-dendrite',
    name: 'Apical Dendrite',
    latinName: 'Dendritum apicale',
    category: 'Receptive Processes',
    region: 'Dendritic Tree',
    description: 'Primary ascending dendrite projecting toward superficial cortical layers. Receives synaptic inputs. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:basal-dendrites',
    name: 'Basal Dendrites',
    latinName: 'Dendrita basalia',
    category: 'Receptive Processes',
    region: 'Dendritic Tree',
    description: 'Branching dendritic network extending radially from the base of the cell soma. Illustrative schematic.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:dendritic-spines',
    name: 'Dendritic Spines',
    latinName: 'Spinulae dendriticae',
    category: 'Receptive Processes',
    region: 'Dendritic Tree',
    description: 'Small membranous protrusions from dendrites serving as the primary site of excitatory synaptic contacts. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:axon-hillock',
    name: 'Axon Hillock',
    latinName: 'Collum axonicum',
    category: 'Axonal Architecture',
    region: 'Axon',
    description: 'Specialized conical transition region connecting the soma to the axon initial segment. Site of action potential integration. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:initial-segment',
    name: 'Axon Initial Segment (AIS)',
    latinName: 'Segmentum initiale axonicum',
    category: 'Axonal Architecture',
    region: 'Axon',
    description: 'High-density voltage-gated sodium channel domain where action potentials are typically triggered. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:axon-proper',
    name: 'Axon Proper',
    latinName: 'Axon neurale',
    category: 'Axonal Architecture',
    region: 'Axon',
    description: 'Cylindrical cytoplasmic projection propagating impulses away from the cell body toward distant targets. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:myelin-sheath',
    name: 'Myelin Sheath',
    latinName: 'Stratum myelini',
    category: 'Insulation & Conduction',
    region: 'Axon',
    description: 'Multi-layered lipid-rich membrane insulating axon segments to enable rapid saltatory conduction. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:node-of-ranvier',
    name: 'Node of Ranvier',
    latinName: 'Nodus neurofibrae',
    category: 'Insulation & Conduction',
    region: 'Axon',
    description: 'Periodic unmyelinated gap along an insulated axon exposing voltage-gated ion channels. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:axon-collateral',
    name: 'Axon Collateral Branches',
    latinName: 'Rami collaterales axonis',
    category: 'Transmitting Terminals',
    region: 'Axon Terminal',
    description: 'Side branches of the main axon allowing signal transmission to multiple downstream neuronal targets. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:synaptic-bouton',
    name: 'Synaptic Boutons (Presynaptic Terminals)',
    latinName: 'Bouton terminalis',
    category: 'Transmitting Terminals',
    region: 'Axon Terminal',
    description: 'Bulbous terminal swellings containing neurotransmitter vesicles ready for exocytosis across synaptic clefts. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
  {
    id: 'neuro:neuron:synaptic-cleft',
    name: 'Synaptic Cleft & Postsynaptic Density',
    latinName: 'Fissura synaptica',
    category: 'Transmitting Terminals',
    region: 'Synapse',
    description: 'Microscopic 20nm extracellular space between presynaptic terminal and postsynaptic membrane. Illustrative.',
    source: 'Illustrative schematic (Pending Neuron Lab integration)',
    selectable: true,
  },
];

interface RawManifestOrgan {
  organ_id: string;
  ta2_latin: string;
  name_en: string;
  system: string;
  mesh_file: string;
  node: string;
  path: string[];
}

function deriveSide(nameEn: string, organId: string): 'left' | 'right' | 'midline' | 'unknown' {
  const lower = (nameEn + ' ' + organId).toLowerCase();
  if (lower.includes('(left)') || lower.includes('.l') || organId.endsWith('_l')) return 'left';
  if (lower.includes('(right)') || lower.includes('.r') || organId.endsWith('_r')) return 'right';
  if (lower.includes('anterior') || lower.includes('posterior') || lower.includes('medial')) return 'midline';
  return 'unknown';
}

function deriveCategoryForNervousSystem(organ: RawManifestOrgan): string {
  const p0 = organ.path[0] || '';
  const p1 = organ.path[1] || '';
  if (p0 === 'Peripheral nervous system') {
    if (p1.includes('Cranial')) return 'Cranial Nerves (CN I–XII)';
    if (p1.includes('Spinal')) return 'Spinal Nerves & Plexuses';
    if (p1.includes('Automatic') || p1.includes('Sympathetic')) return 'Autonomic Nervous System';
    return 'Peripheral Nerves';
  }
  if (p0 === 'Central nervous system') {
    if (p1.includes('Spinal cord')) return 'Spinal Cord & Segments';
    if (p1.includes('Brain')) return 'Central Nervous System (Brain)';
    return 'Central Nervous System';
  }
  if (p0 === 'Sense organs') return 'Sensory Organs & Receptors';
  return 'Nervous System Structures';
}

function deriveCategoryForBrainAtlas(organ: RawManifestOrgan): string {
  const p = organ.path;
  const p2 = p[2] || '';
  const p3 = p[3] || '';
  if (p2.includes('Cerebellum') || p3.includes('Cerebellum')) return 'Cerebellum';
  if (p2.includes('Brainstem') || p3.includes('Brainstem') || p2.includes('Mesencephalon') || p2.includes('Pons') || p2.includes('Medulla')) {
    return 'Brainstem';
  }
  if (p2.includes('Ventricular') || p2.includes('Ventricle') || p.some(seg => seg.toLowerCase().includes('ventric'))) {
    return 'Ventricular System';
  }
  if (p2.includes('Diencephalon') || p2.includes('Thalamus') || p2.includes('Hypothalamus')) {
    return 'Diencephalon & Deep Nuclei';
  }
  if (p2.includes('Telencephalon') || p2.includes('Cerebral') || p2.includes('Lobe') || p2.includes('Hemisphere')) {
    return 'Cerebral Cortex & Lobes';
  }
  return 'Brain Structures';
}

/**
 * Normalizes manifest nervous organs into NeuroStructureView models.
 */
export function normalizeNervousManifest(
  rawOrgans: RawManifestOrgan[],
  mode: NeuroMode
): NeuroStructureView[] {
  if (mode === 'neuron-lab') {
    return NEURON_LAB_STRUCTURES;
  }

  const nervousOrgans = rawOrgans.filter(o => o.system === 'nervous');

  if (mode === 'brain-atlas') {
    return nervousOrgans
      .filter(o => o.path[0] === 'Central nervous system' && o.path[1] === 'Brain')
      .map(o => ({
        id: `neuro:brain:${o.organ_id}`,
        name: o.name_en,
        latinName: o.ta2_latin || undefined,
        category: deriveCategoryForBrainAtlas(o),
        region: o.path.slice(2).join(' / ') || 'Brain',
        side: deriveSide(o.name_en, o.organ_id),
        source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
        selectable: true,
        description: `Verified anatomical structure from the reference brain atlas (${o.path.join(' → ')}).`,
      }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }

  // mode === 'nervous-system'
  return nervousOrgans
    .map(o => ({
      id: `neuro:system:${o.organ_id}`,
      name: o.name_en,
      latinName: o.ta2_latin || undefined,
      category: deriveCategoryForNervousSystem(o),
      region: o.path.join(' / '),
      side: deriveSide(o.name_en, o.organ_id),
      source: 'Z-Anatomy / BodyParts3D (CC BY-SA 4.0)',
      selectable: true,
      description: `Segmented peripheral/central nervous structure from the reference anatomical atlas (${o.path.join(' → ')}).`,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
