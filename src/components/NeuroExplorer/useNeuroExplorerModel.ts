/**
 * BoneVista Neuro & Brain Explorer — UI model hook
 *
 * Adapts the NeuroExplorerStore to the NeuroExplorerViewProps contract
 * (Section 6 of the parallel-agent contract).
 *
 * Loads authentic anatomy structures from BoneVista's verified manifest.json
 * for Whole Nervous System and Brain Atlas, and illustrative morphology for Neuron Lab.
 *
 * Owner: Antigravity Flash High (hook; console stubs)
 * Camera / isolate / focus wiring: Codex Luna High (will inject via ref or store)
 */

import { useCallback, useEffect } from 'react';
import { useNeuroExplorerStore } from './neuroExplorerStore';
import type { NeuroExplorerViewProps } from './types';
import { normalizeNervousManifest, DEFAULT_NEURO_LAYERS, NEURON_LAB_STRUCTURES } from './neuroAtlasData';

// Module-level cache for manifest organs
let cachedManifestOrgans: any[] | null = null;

// ── Camera action stubs ───────────────────────────────────────────────────────
// Codex Luna High replaces these by wiring the real scene callbacks.
// They are exported so NeuroExplorerPage can override them.
export const NEURO_CAMERA_STUBS = {
  isolate: () => console.info('[NeuroExplorer] isolate — awaiting Codex wiring'),
  focus:   () => console.info('[NeuroExplorer] focus — awaiting Codex wiring'),
  reset:   () => console.info('[NeuroExplorer] reset — awaiting Codex wiring'),
};

export interface UseNeuroExplorerModelOptions {
  /** Injected by Codex to override camera stubs */
  onIsolateSelection?: () => void;
  onFocusSelection?: () => void;
  onResetView?: () => void;
}

/**
 * Returns all props needed by NeuroExplorerPanel.
 * Automatically synchronizes structures and layers for the active mode.
 */
export function useNeuroExplorerModel(
  options: UseNeuroExplorerModelOptions = {},
): NeuroExplorerViewProps & {
  hiddenIds: Set<string>;
  onToggleStructureVisibility: (id: string) => void;
  onRetry: () => void;
} {
  const state = useNeuroExplorerStore();

  // Load manifest & normalize structures for the active mode
  useEffect(() => {
    let active = true;

    if (state.activeMode === 'neuron-lab') {
      state.setStructures(NEURON_LAB_STRUCTURES);
      state.setLayers(DEFAULT_NEURO_LAYERS['neuron-lab']);
      state.setLoading(false);
      state.setError(undefined);
      return;
    }

    if (cachedManifestOrgans) {
      const normalized = normalizeNervousManifest(cachedManifestOrgans, state.activeMode);
      state.setStructures(normalized);
      state.setLayers(DEFAULT_NEURO_LAYERS[state.activeMode]);
      state.setLoading(false);
      state.setError(undefined);
      return;
    }

    state.setLoading(true);
    state.setError(undefined);

    fetch('/anatomy/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load anatomy manifest (${res.status})`);
        return res.json();
      })
      .then((manifest) => {
        if (!active) return;
        cachedManifestOrgans = manifest.organs || [];
        const normalized = normalizeNervousManifest(cachedManifestOrgans!, state.activeMode);
        state.setStructures(normalized);
        state.setLayers(DEFAULT_NEURO_LAYERS[state.activeMode]);
        state.setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load neuro anatomy structures.';
        state.setError(msg);
        state.setLoading(false);
      });

    return () => { active = false; };
  }, [state.activeMode, state.loadRequest]);

  const onToggleStructure = useCallback(
    (id: string) => state.toggleStructure(id),
    [state.toggleStructure],
  );

  const onToggleLayer = useCallback(
    (id: string) => state.toggleLayer(id),
    [state.toggleLayer],
  );

  const onLayerOpacityChange = useCallback(
    (id: string, opacity: number) => state.setLayerOpacity(id, opacity),
    [state.setLayerOpacity],
  );

  const onClearSelection = useCallback(
    () => state.clearSelection(),
    [state.clearSelection],
  );

  const onToggleStructureVisibility = useCallback(
    (id: string) => state.toggleStructureVisibility(id),
    [state.toggleStructureVisibility],
  );

  const onRetry = useCallback(() => state.retryLoad(), [state.retryLoad]);

  return {
    activeMode: state.activeMode,
    onModeChange: state.setActiveMode,

    loading: state.loading,
    error: state.error,

    searchQuery: state.searchQuery,
    onSearchChange: state.setSearchQuery,

    structures: state.structures,
    selectedIds: state.selectedIds,
    onToggleStructure,

    layers: state.layers,
    onToggleLayer,
    onLayerOpacityChange,

    onIsolateSelection: options.onIsolateSelection ?? NEURO_CAMERA_STUBS.isolate,
    onClearSelection,
    onFocusSelection: options.onFocusSelection ?? NEURO_CAMERA_STUBS.focus,
    onResetView: options.onResetView ?? NEURO_CAMERA_STUBS.reset,

    // Extra fields for the host panel
    hiddenIds: state.hiddenIds,
    onToggleStructureVisibility,
    onRetry,
  };
}
