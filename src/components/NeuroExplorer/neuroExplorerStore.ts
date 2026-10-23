/**
 * BoneVista Neuro & Brain Explorer — App-state slice
 *
 * Zustand state for the Neuro & Brain Explorer feature.
 * This is the only new state slice; it does NOT touch the existing
 * anatomyStructures, selectedBones, hiddenBones, or muscleStructures fields.
 *
 * Owner:
 *   - State shape / slice: Antigravity Flash High proposes it here.
 *   - 3D integration (scene callbacks): Codex Luna High wires the
 *     real onToggleStructure / onToggleLayer / camera actions.
 *   - Review before merging: Codex Luna High.
 *
 * This file is UI-proposed; Codex must integrate it into appStore or
 * provide an equivalent without duplication.
 */

import { create } from 'zustand';
import type { NeuroMode, NeuroStructureView, NeuroLayerView } from './types';

export interface NeuroExplorerState {
  // ── Mode ──────────────────────────────────────────────────────────
  activeMode: NeuroMode;
  setActiveMode: (mode: NeuroMode) => void;

  // ── Loading / error lifecycle ──────────────────────────────────────
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | undefined;
  setError: (msg: string | undefined) => void;

  // ── Search ────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // ── Structures (populated by Codex after asset loads) ─────────────
  structures: NeuroStructureView[];
  setStructures: (items: NeuroStructureView[]) => void;

  // ── Selection ─────────────────────────────────────────────────────
  selectedIds: string[];
  toggleStructure: (id: string) => void;
  clearSelection: () => void;

  // ── Layers (populated by Codex after asset loads) ──────────────────
  layers: NeuroLayerView[];
  setLayers: (layers: NeuroLayerView[]) => void;
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;

  // ── Hidden structures (per-structure visibility from 3D core) ──────
  hiddenIds: Set<string>;
  toggleStructureVisibility: (id: string) => void;

  // ── Load request counter (bump to trigger retry in Codex hook) ─────
  loadRequest: number;
  retryLoad: () => void;
}

export const useNeuroExplorerStore = create<NeuroExplorerState>((set, get) => ({
  activeMode: 'nervous-system',
  setActiveMode: (mode) =>
    set({
      activeMode: mode,
      searchQuery: '',
      selectedIds: [],
      error: undefined,
    }),

  loading: false,
  setLoading: (v) => set({ loading: v }),
  error: undefined,
  setError: (msg) => set({ error: msg }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  structures: [],
  setStructures: (items) => set({ structures: items }),

  selectedIds: [],
  toggleStructure: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((s) => s !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },
  clearSelection: () => set({ selectedIds: [] }),

  layers: [],
  setLayers: (layers) => set({ layers }),
  toggleLayer: (id) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l,
      ),
    }));
  },
  setLayerOpacity: (id, opacity) => {
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id ? { ...l, opacity } : l,
      ),
    }));
  },

  hiddenIds: new Set(),
  toggleStructureVisibility: (id) => {
    set((state) => {
      const next = new Set(state.hiddenIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { hiddenIds: next };
    });
  },

  loadRequest: 0,
  retryLoad: () =>
    set((state) => ({
      loadRequest: state.loadRequest + 1,
      error: undefined,
      loading: true,
    })),
}));
