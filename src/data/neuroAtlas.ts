export type NeuroMode = 'nervous-system' | 'brain-atlas';

export interface NeuroStructure {
  id: string;
  name: string;
  category: string;
  side?: 'left' | 'right' | 'midline' | 'unknown';
  region?: string;
  source?: string;
  latinName?: string;
  description?: string;
  aliases?: string[];
  meshNames: string[];
  sourceId?: string | number;
}

export interface NeuroManifest {
  structures: NeuroStructure[];
  categories?: Record<string, { label: string; count: number }>;
}

export interface NeuroStructureView {
  id: string;
  name: string;
  category: string;
  side?: 'left' | 'right' | 'midline' | 'unknown';
  region?: string;
  source?: string;
  latinName?: string;
  description?: string;
  selectable: boolean;
}

export interface NeuroLayerView {
  id: string;
  label: string;
  available: boolean;
  visible: boolean;
  opacity: number;
}

export interface NeuroExplorerViewProps {
  activeMode: NeuroMode;
  onModeChange: (mode: NeuroMode) => void;
  loading: boolean;
  error?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  structures: NeuroStructureView[];
  selectedIds: string[];
  onToggleStructure: (id: string) => void;
  layers: NeuroLayerView[];
  onToggleLayer: (id: string) => void;
  onLayerOpacityChange?: (id: string, opacity: number) => void;
  onIsolateSelection: () => void;
  onClearSelection: () => void;
  onFocusSelection: () => void;
  onResetView: () => void;
  onRetry: () => void;
}

export const NEURO_ASSETS = {
  brain: '/neuro/brain.glb',
  brainManifest: '/neuro/brain-manifest.json',
  nerves: '/neuro/nerves.glb',
  nervesManifest: '/neuro/nerves-manifest.json',
} as const;

export function filterNeuroStructures(structures: NeuroStructure[], query: string): NeuroStructure[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return structures;
  return structures.filter((structure) =>
    `${structure.name} ${structure.category} ${structure.region ?? ''} ${structure.side ?? ''} ${(structure.aliases ?? []).join(' ')}`
      .toLocaleLowerCase().includes(needle),
  );
}
