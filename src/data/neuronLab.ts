import type { NeuroLayerView, NeuroStructure } from './neuroAtlas';

// These rows and layers describe the existing illustrative neuron diagram.
// They use the shared Neuro Explorer state, but do not claim to be measured
// morphology or a validated electrophysiology model.
export const NEURON_LAB_LAYERS: NeuroLayerView[] = [
  { id: 'layer:neuron:soma', label: 'Soma & Cell Body', available: true, visible: true, opacity: 1 },
  { id: 'layer:neuron:dendrites', label: 'Dendrites & Spines', available: true, visible: true, opacity: 1 },
  { id: 'layer:neuron:axon', label: 'Axon & Axon Hillock', available: true, visible: true, opacity: 1 },
  { id: 'layer:neuron:myelin', label: 'Myelin Sheath & Nodes', available: true, visible: true, opacity: 1 },
  { id: 'layer:neuron:synapse', label: 'Synaptic Boutons & Terminals', available: true, visible: true, opacity: 1 },
  { id: 'layer:neuron:signal', label: 'Illustrative Signal Animation', available: true, visible: true, opacity: 1 },
];

const source = 'Illustrative schematic; not an empirical neuronal reconstruction.';

export const NEURON_LAB_STRUCTURES: NeuroStructure[] = [
  { id: 'neuro:neuron:soma', name: 'Soma (Perikaryon)', latinName: 'Corpus neurale', category: 'Cell Body & Organelles', region: 'Cell Body', source, meshNames: [] },
  { id: 'neuro:neuron:nucleus', name: 'Neuronal Nucleus & Nucleolus', latinName: 'Nucleus neuronii', category: 'Cell Body & Organelles', region: 'Cell Body', source, meshNames: [] },
  { id: 'neuro:neuron:apical-dendrite', name: 'Apical Dendrite', latinName: 'Dendritum apicale', category: 'Receptive Processes', region: 'Dendritic Tree', source, meshNames: [] },
  { id: 'neuro:neuron:basal-dendrites', name: 'Basal Dendrites', latinName: 'Dendrita basalia', category: 'Receptive Processes', region: 'Dendritic Tree', source, meshNames: [] },
  { id: 'neuro:neuron:dendritic-spines', name: 'Dendritic Spines', latinName: 'Spinulae dendriticae', category: 'Receptive Processes', region: 'Dendritic Tree', source, meshNames: [] },
  { id: 'neuro:neuron:axon-hillock', name: 'Axon Hillock', latinName: 'Collum axonicum', category: 'Axonal Architecture', region: 'Axon', source, meshNames: [] },
  { id: 'neuro:neuron:initial-segment', name: 'Axon Initial Segment (AIS)', latinName: 'Segmentum initiale axonicum', category: 'Axonal Architecture', region: 'Axon', source, meshNames: [] },
  { id: 'neuro:neuron:axon-proper', name: 'Axon Proper', latinName: 'Axon neurale', category: 'Axonal Architecture', region: 'Axon', source, meshNames: [] },
  { id: 'neuro:neuron:myelin-sheath', name: 'Myelin Sheath', latinName: 'Stratum myelini', category: 'Insulation & Conduction', region: 'Axon', source, meshNames: [] },
  { id: 'neuro:neuron:node-of-ranvier', name: 'Node of Ranvier', latinName: 'Nodus neurofibrae', category: 'Insulation & Conduction', region: 'Axon', source, meshNames: [] },
  { id: 'neuro:neuron:axon-collateral', name: 'Axon Collateral Branches', latinName: 'Rami collaterales axonis', category: 'Transmitting Terminals', region: 'Axon Terminal', source, meshNames: [] },
  { id: 'neuro:neuron:synaptic-bouton', name: 'Synaptic Boutons (Presynaptic Terminals)', latinName: 'Bouton terminalis', category: 'Transmitting Terminals', region: 'Axon Terminal', source, meshNames: [] },
  { id: 'neuro:neuron:synaptic-cleft', name: 'Synaptic Cleft & Postsynaptic Density', latinName: 'Fissura synaptica', category: 'Transmitting Terminals', region: 'Synapse', source, meshNames: [] },
];
