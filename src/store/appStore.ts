import { create } from 'zustand';
import type { NeuroManifest, NeuroMode } from '../data/neuroAtlas';

export type ViewMode = 'bone' | 'stress' | 'xray';
export type Theme = 'dark' | 'light';
export type AnatomicalView = 'anterior' | 'posterior' | 'lateral-l' | 'lateral-r' | 'superior' | 'inferior';
export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'sacral' | 'all';
export type MuscleLayerPreset = 'bones' | 'superficial' | 'deep' | 'combined';
export type MuscleExplorerStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MuscleAtlasStructure {
  id: string;
  name: string;
  kind: 'bone' | 'muscle';
  layer?: 'superficial' | 'deep';
  side: 'left' | 'right' | 'midline' | 'bilateral' | 'unknown';
  region?: string;
  source: string;
  fmaId?: string;
  meshNames: string[];
}

export interface BoneInfo {
  id: string;
  name: string;
  region: string;
  description: string;
  isSelectable: boolean; // false if part of a fused mesh
}

export interface Study {
  id: string;
  patientId: string;
  label: string;
  date: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export interface XrayUpload {
  ap: File | null;
  lateral: File | null;
  apPreview: string | null;
  lateralPreview: string | null;
}

export interface AnatomyStructure {
  organ_id: string;
  ta2_latin: string;
  name_en: string;
  system: string;
  mesh_file: string;
  node: string;
  path: string[];
}

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Navigation
  activePage: 'dashboard' | 'viewer' | 'muscles' | 'neuro' | 'brain' | 'spine' | 'xray' | 'stress' | 'studies' | 'neet' | 'settings' | 'resources';
  setActivePage: (page: AppState['activePage']) => void;

  // 3D Viewer
  anatomyStructures: AnatomyStructure[];
  setAnatomyStructures: (structures: AnatomyStructure[]) => void;
  muscleStructures: MuscleAtlasStructure[];
  setMuscleStructures: (structures: MuscleAtlasStructure[]) => void;
  muscleStatus: MuscleExplorerStatus;
  setMuscleStatus: (status: MuscleExplorerStatus) => void;
  muscleError: string | null;
  setMuscleError: (message: string | null) => void;
  muscleLoadRequest: number;
  retryMuscleAtlas: () => void;
  musclePreset: MuscleLayerPreset;
  setMusclePreset: (preset: MuscleLayerPreset) => void;
  muscleQuery: string;
  setMuscleQuery: (query: string) => void;
  neuroMode: NeuroMode;
  setNeuroMode: (mode: NeuroMode) => void;
  neuroQuery: string;
  setNeuroQuery: (query: string) => void;
  neuroBrainManifest: NeuroManifest | null;
  neuroNervesManifest: NeuroManifest | null;
  setNeuroManifests: (brain: NeuroManifest, nerves: NeuroManifest) => void;
  neuroStatus: MuscleExplorerStatus;
  neuroError: string | null;
  setNeuroStatus: (status: MuscleExplorerStatus, error?: string | null) => void;
  neuroLoadRequest: number;
  retryNeuroLoad: () => void;
  selectedNeuroStructures: Set<string>;
  toggleNeuroStructure: (id: string) => void;
  clearNeuroSelection: () => void;
  hiddenNeuroStructures: Set<string>;
  toggleNeuroStructureVisibility: (id: string) => void;
  hiddenNeuroLayers: Set<string>;
  toggleNeuroLayer: (id: string) => void;
  neuroLayerOpacity: Record<string, number>;
  setNeuroLayerOpacity: (id: string, opacity: number) => void;
  neuroIsolationMode: boolean;
  toggleNeuroIsolation: () => void;
  neuroCameraAction: { type: 'focus' | 'fit'; sequence: number };
  focusNeuroSelection: () => void;
  resetNeuroView: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  anatomicalView: AnatomicalView;
  setAnatomicalView: (view: AnatomicalView) => void;
  selectedBones: Set<string>;
  toggleBoneSelection: (id: string) => void;
  clearMuscleSelection: () => void;
  stressTargetId: string | null;
  setStressTargetId: (id: string | null) => void;
  stressResultMPa: number | null;
  setStressResultMPa: (stress: number | null) => void;
  clearBoneSelection: () => void;
  hiddenBones: Set<string>;
  toggleBoneVisibility: (id: string) => void;
  isolationMode: boolean;
  setIsolationMode: (v: boolean) => void;
  isRotating: boolean;
  setIsRotating: (v: boolean) => void;

  // Spine
  spineRegion: SpineRegion;
  setSpineRegion: (r: SpineRegion) => void;
  selectedVertebra: string | null;
  setSelectedVertebra: (id: string | null) => void;

  // X-ray workspace
  xrayUpload: XrayUpload;
  setXrayAP: (file: File | null) => void;
  setXrayLateral: (file: File | null) => void;
  xrayTargetBoneId: string | null;
  setXrayTargetBone: (id: string | null) => void;

  // Studies
  studies: Study[];
  activeStudyId: string | null;
  setActiveStudy: (id: string | null) => void;

  // UI state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  rightPanelOpen: boolean;
  setRightPanelOpen: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (() => {
    try { return localStorage.getItem('bonevista-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  })(),
  setTheme: (theme) => {
    try { localStorage.setItem('bonevista-theme', theme); } catch { /* Keep the in-memory preference. */ }
    set({ theme });
  },
  activePage: 'dashboard',
  setActivePage: (page) => set({ activePage: page }),

  anatomyStructures: [],
  setAnatomyStructures: (structures) => set({ anatomyStructures: structures }),
  muscleStructures: [],
  setMuscleStructures: (structures) => set({ muscleStructures: structures }),
  muscleStatus: 'idle',
  setMuscleStatus: (status) => set({ muscleStatus: status, muscleError: status === 'error' ? get().muscleError : null }),
  muscleError: null,
  setMuscleError: (message) => set({ muscleError: message, muscleStatus: message ? 'error' : get().muscleStatus }),
  muscleLoadRequest: 0,
  retryMuscleAtlas: () => set((state) => ({ muscleLoadRequest: state.muscleLoadRequest + 1, muscleError: null, muscleStatus: 'loading' })),
  musclePreset: 'bones',
  setMusclePreset: (preset) => set({ musclePreset: preset, isolationMode: false }),
  muscleQuery: '',
  setMuscleQuery: (query) => set({ muscleQuery: query }),
  neuroMode: 'nervous-system',
  setNeuroMode: (mode) => set((state) => ({
    neuroMode: mode,
    neuroStatus: 'loading',
    neuroError: null,
    hiddenNeuroLayers: mode === 'brain-atlas' ? new Set(['neuro:brain:cranial_nerves']) : new Set(),
    neuroIsolationMode: false,
    selectedNeuroStructures: new Set(),
    neuroCameraAction: { type: 'fit', sequence: state.neuroCameraAction.sequence + 1 },
  })),
  neuroQuery: '',
  setNeuroQuery: (query) => set({ neuroQuery: query }),
  neuroBrainManifest: null,
  neuroNervesManifest: null,
  setNeuroManifests: (brain, nerves) => set({ neuroBrainManifest: brain, neuroNervesManifest: nerves }),
  neuroStatus: 'idle',
  neuroError: null,
  setNeuroStatus: (status, error = null) => set({ neuroStatus: status, neuroError: status === 'error' ? error : null }),
  neuroLoadRequest: 0,
  retryNeuroLoad: () => set((state) => ({ neuroLoadRequest: state.neuroLoadRequest + 1, neuroStatus: 'loading', neuroError: null })),
  selectedNeuroStructures: new Set(),
  toggleNeuroStructure: (id) => set((state) => {
    const selected = new Set(state.selectedNeuroStructures);
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    return { selectedNeuroStructures: selected };
  }),
  clearNeuroSelection: () => set({ selectedNeuroStructures: new Set(), neuroIsolationMode: false }),
  hiddenNeuroStructures: new Set(),
  toggleNeuroStructureVisibility: (id) => set((state) => {
    const hidden = new Set(state.hiddenNeuroStructures);
    if (hidden.has(id)) hidden.delete(id); else hidden.add(id);
    return { hiddenNeuroStructures: hidden };
  }),
  hiddenNeuroLayers: new Set(),
  toggleNeuroLayer: (id) => set((state) => {
    const hidden = new Set(state.hiddenNeuroLayers);
    if (hidden.has(id)) hidden.delete(id); else hidden.add(id);
    return { hiddenNeuroLayers: hidden };
  }),
  neuroLayerOpacity: {},
  setNeuroLayerOpacity: (id, opacity) => set((state) => ({ neuroLayerOpacity: { ...state.neuroLayerOpacity, [id]: Math.max(0, Math.min(1, opacity)) } })),
  neuroIsolationMode: false,
  toggleNeuroIsolation: () => set((state) => ({ neuroIsolationMode: !state.neuroIsolationMode })),
  neuroCameraAction: { type: 'fit', sequence: 0 },
  focusNeuroSelection: () => set((state) => ({ neuroCameraAction: { type: 'focus', sequence: state.neuroCameraAction.sequence + 1 } })),
  resetNeuroView: () => set((state) => ({ neuroCameraAction: { type: 'fit', sequence: state.neuroCameraAction.sequence + 1 } })),
  viewMode: 'bone',
  setViewMode: (mode) => set({ viewMode: mode }),
  anatomicalView: 'anterior',
  setAnatomicalView: (view) => set({ anatomicalView: view }),
  selectedBones: new Set(),
  toggleBoneSelection: (id) => {
    const next = new Set(get().selectedBones);
    if (next.has(id)) next.delete(id); else next.add(id);
    set({ selectedBones: next });
  },
  clearMuscleSelection: () => set((state) => {
    const muscleIds = new Set(state.muscleStructures.map((structure) => structure.id));
    return {
      selectedBones: new Set([...state.selectedBones].filter((id) => !muscleIds.has(id))),
      isolationMode: false,
    };
  }),
  stressTargetId: null,
  setStressTargetId: (id) => set({ stressTargetId: id, selectedBones: id ? new Set([id]) : new Set(), stressResultMPa: null }),
  stressResultMPa: null,
  setStressResultMPa: (stress) => set({ stressResultMPa: stress }),
  clearBoneSelection: () => set({ selectedBones: new Set() }),
  hiddenBones: new Set(),
  toggleBoneVisibility: (id) => {
    const next = new Set(get().hiddenBones);
    if (next.has(id)) next.delete(id); else next.add(id);
    set({ hiddenBones: next });
  },
  isolationMode: false,
  setIsolationMode: (v) => set({ isolationMode: v }),
  isRotating: true,
  setIsRotating: (v) => set({ isRotating: v }),

  spineRegion: 'all',
  setSpineRegion: (r) => set({ spineRegion: r }),
  selectedVertebra: null,
  setSelectedVertebra: (id) => set({ selectedVertebra: id }),

  xrayUpload: { ap: null, lateral: null, apPreview: null, lateralPreview: null },
  setXrayAP: (file) => {
    const prev = get().xrayUpload;
    if (prev.apPreview) URL.revokeObjectURL(prev.apPreview);
    set({ xrayUpload: { ...prev, ap: file, apPreview: file ? URL.createObjectURL(file) : null } });
  },
  setXrayLateral: (file) => {
    const prev = get().xrayUpload;
    if (prev.lateralPreview) URL.revokeObjectURL(prev.lateralPreview);
    set({ xrayUpload: { ...prev, lateral: file, lateralPreview: file ? URL.createObjectURL(file) : null } });
  },
  xrayTargetBoneId: null,
  setXrayTargetBone: (id) => set({
    xrayTargetBoneId: id,
    selectedBones: id ? new Set([id]) : new Set(),
    hiddenBones: new Set([...get().hiddenBones].filter((hiddenId) => hiddenId !== id)),
    isolationMode: false,
  }),

  studies: [],
  activeStudyId: null,
  setActiveStudy: (id) => set({ activeStudyId: id }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  rightPanelOpen: true,
  setRightPanelOpen: (v) => set({ rightPanelOpen: v }),
}));
