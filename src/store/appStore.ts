import { create } from 'zustand';

export type ViewMode = 'bone' | 'stress' | 'xray';
export type Theme = 'dark' | 'light';
export type AnatomicalView = 'anterior' | 'posterior' | 'lateral-l' | 'lateral-r' | 'superior' | 'inferior';
export type SpineRegion = 'cervical' | 'thoracic' | 'lumbar' | 'sacral' | 'all';

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

export type ReconstructionStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error' | 'demo';

export interface ReconstructionResult {
  status: ReconstructionStatus;
  modelUrl: string | null;
  metrics: {
    meanError: number | null;
    hausdorff95: number | null;
    foldsUsed: number | null;
    inferenceTime: number | null;
  };
  errorMessage: string | null;
  isDemoMode: boolean;
}

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Navigation
  activePage: 'dashboard' | 'viewer' | 'spine' | 'xray' | 'stress' | 'studies' | 'settings';
  setActivePage: (page: AppState['activePage']) => void;

  // 3D Viewer
  anatomyStructures: AnatomyStructure[];
  setAnatomyStructures: (structures: AnatomyStructure[]) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  anatomicalView: AnatomicalView;
  setAnatomicalView: (view: AnatomicalView) => void;
  selectedBones: Set<string>;
  toggleBoneSelection: (id: string) => void;
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
  reconstruction: ReconstructionResult;
  runReconstruction: () => Promise<void>;
  resetReconstruction: () => void;

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

const defaultReconstruction: ReconstructionResult = {
  status: 'idle',
  modelUrl: null,
  metrics: { meanError: null, hausdorff95: null, foldsUsed: null, inferenceTime: null },
  errorMessage: null,
  isDemoMode: false,
};

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
  clearBoneSelection: () => set({ selectedBones: new Set() }),
  hiddenBones: new Set(),
  toggleBoneVisibility: (id) => {
    const next = new Set(get().hiddenBones);
    if (next.has(id)) next.delete(id); else next.add(id);
    set({ hiddenBones: next });
  },
  isolationMode: false,
  setIsolationMode: (v) => set({ isolationMode: v }),
  isRotating: false,
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
  reconstruction: defaultReconstruction,
  runReconstruction: async () => {
    const { xrayUpload } = get();
    if (!xrayUpload.ap || !xrayUpload.lateral) return;

    set({ reconstruction: {
      ...defaultReconstruction,
      status: 'error',
      errorMessage: 'Reconstruction is unavailable. No validated inference service or compatible checkpoint is configured.',
    } });
  },
  resetReconstruction: () => set({ reconstruction: defaultReconstruction }),

  studies: [],
  activeStudyId: null,
  setActiveStudy: (id) => set({ activeStudyId: id }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  rightPanelOpen: true,
  setRightPanelOpen: (v) => set({ rightPanelOpen: v }),
}));
