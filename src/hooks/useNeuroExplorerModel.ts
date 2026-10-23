import { useCallback, useMemo } from 'react';
import type { NeuroExplorerViewProps, NeuroLayerView, NeuroMode, NeuroStructure } from '../data/neuroAtlas';
import { useAppStore } from '../store/appStore';
import { NEURON_LAB_LAYERS, NEURON_LAB_STRUCTURES } from '../data/neuronLab';

function asViews(structures: NeuroStructure[]) {
  return structures.map(({ id, name, category, side, region, source, latinName, description }) => ({
    id, name, category, side, region, source, latinName, description,
    selectable: true,
  }));
}

export function useNeuroExplorerModel(): NeuroExplorerViewProps {
  const state = useAppStore();
  const structures = useMemo(() => {
    if (state.neuroMode === 'neuron-lab') return NEURON_LAB_STRUCTURES;
    if (!state.neuroBrainManifest || !state.neuroNervesManifest) return [];
    return state.neuroMode === 'brain-atlas'
      ? state.neuroBrainManifest.structures
      : [...state.neuroBrainManifest.structures.filter((item) => item.category !== 'cranial_nerves'), ...state.neuroNervesManifest.structures];
  }, [state.neuroMode, state.neuroBrainManifest, state.neuroNervesManifest]);

  const layers = useMemo<NeuroLayerView[]>(() => {
    const layer = (id: string, label: string, available = true): NeuroLayerView => ({
      id, label, available,
      visible: available && !state.hiddenNeuroLayers.has(id),
      opacity: state.neuroLayerOpacity[id] ?? 1,
    });
    if (state.neuroMode === 'nervous-system') return [
      layer('neuro:system:brain', 'Brain atlas'),
      layer('neuro:system:nerves', 'Cranial and peripheral nerves'),
      layer('neuro:system:spinal-cord', 'Spinal cord', false),
    ];
    if (state.neuroMode === 'brain-atlas') {
      return Object.entries(state.neuroBrainManifest?.categories ?? {}).map(([id, category]) =>
        layer(`neuro:brain:${id}`, category.label),
      );
    }
    return NEURON_LAB_LAYERS.map(({ id, label, available }) => layer(id, label, available));
  }, [state.neuroMode, state.neuroBrainManifest, state.hiddenNeuroLayers, state.neuroLayerOpacity]);

  const onModeChange = useCallback((mode: NeuroMode) => state.setNeuroMode(mode), [state.setNeuroMode]);
  const onToggleStructure = useCallback((id: string) => state.toggleNeuroStructure(id), [state.toggleNeuroStructure]);
  const onToggleLayer = useCallback((id: string) => {
    if (id !== 'neuro:system:spinal-cord') state.toggleNeuroLayer(id);
  }, [state.toggleNeuroLayer]);
  const onLayerOpacityChange = useCallback((id: string, opacity: number) => state.setNeuroLayerOpacity(id, opacity), [state.setNeuroLayerOpacity]);

  return {
    activeMode: state.neuroMode,
    onModeChange,
    loading: state.neuroStatus === 'idle' || state.neuroStatus === 'loading',
    ...(state.neuroError ? { error: state.neuroError } : {}),
    ...(state.neuroMode === 'neuron-lab' ? { modeNotice: 'Neuron Lab is reserved for integration of your separate Neuron branch. No neuron model or neural simulation is bundled in this core change.' } : {}),
    searchQuery: state.neuroQuery,
    onSearchChange: state.setNeuroQuery,
    structures: asViews(structures),
    selectedIds: [...state.selectedNeuroStructures],
    onToggleStructure,
    layers,
    onToggleLayer,
    onLayerOpacityChange,
    onIsolateSelection: state.toggleNeuroIsolation,
    onClearSelection: state.clearNeuroSelection,
    onFocusSelection: state.focusNeuroSelection,
    onResetView: state.resetNeuroView,
    onRetry: state.retryNeuroLoad,
  };
}
