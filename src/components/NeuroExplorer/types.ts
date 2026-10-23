import type {
  NeuroExplorerViewProps as CoreViewProps,
  NeuroLayerView as CoreLayerView,
  NeuroMode,
  NeuroStructureView as CoreStructureView,
} from '../../data/neuroAtlas';

export type { NeuroMode };
export type NeuroLayerView = CoreLayerView;
export interface NeuroStructureView extends CoreStructureView {
  latinName?: string;
  description?: string;
}
export interface NeuroExplorerViewProps extends Omit<CoreViewProps, 'structures' | 'onRetry'> {
  structures: NeuroStructureView[];
  onRetry?: () => void;
}

export const NEURO_MODE_META: Record<NeuroMode, { label: string; description: string }> = {
  'nervous-system': { label: 'Whole Nervous System', description: 'Brain and available nerves at whole-body scale.' },
  'brain-atlas': { label: 'Brain Atlas', description: 'Selectable structures from the detailed brain mesh.' },
  'neuron-lab': { label: 'Neuron Lab', description: 'Separate microscopic-scale neuron experience.' },
};
