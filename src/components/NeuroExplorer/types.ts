/**
 * BoneVista Neuro & Brain Explorer — UI Types
 *
 * Implements the shared UI/data contract defined in
 * docs/NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md (Section 6).
 *
 * Owner: Antigravity Flash High (UI/presentation)
 * Core/data/integration owner: Codex Luna High
 *
 * Do NOT import or use any Three.js, GLTFLoader, or scene state here.
 * These types are the boundary; the 3D core is owned by Codex.
 */

// ─── Mode ─────────────────────────────────────────────────────────────────────

export type NeuroMode = 'nervous-system' | 'brain-atlas' | 'neuron-lab';

// ─── Structures ───────────────────────────────────────────────────────────────

export interface NeuroStructureView {
  /** Stable namespaced ID, e.g. "neuro:brain:cerebellum" */
  id: string;
  /** Primary English display name */
  name: string;
  /** Latin / formal anatomical name when available */
  latinName?: string;
  /** Region/system category, e.g. "Cerebral Lobes", "Cranial Nerves" */
  category: string;
  /** Anatomical laterality */
  side?: 'left' | 'right' | 'midline' | 'unknown';
  /** Anatomical region text, e.g. "Frontal", "Brainstem" */
  region?: string;
  /** Short educational description — validated text only, never invented */
  description?: string;
  /** Provenance: source repository/dataset identifier */
  source?: string;
  /** Whether this entry maps to a selectable 3D mesh or is metadata-only */
  selectable: boolean;
}

// ─── Layers ───────────────────────────────────────────────────────────────────

export interface NeuroLayerView {
  /** Stable layer identifier, e.g. "layer:brain:lobes" */
  id: string;
  /** User-facing label */
  label: string;
  /** Whether the layer is present in the loaded scene */
  available: boolean;
  /** Current render visibility */
  visible: boolean;
  /** Opacity 0–1 when the scene supports per-layer opacity; otherwise 1 */
  opacity: number;
}

// ─── Main view props (the integration boundary) ───────────────────────────────

/**
 * Props consumed by NeuroExplorerPanel.
 * Codex Luna High provides these values; Antigravity builds the panel against
 * this contract. Neither agent may unilaterally change the shape without
 * updating both sides.
 */
export interface NeuroExplorerViewProps {
  /** Currently active scale/mode */
  activeMode: NeuroMode;
  onModeChange: (mode: NeuroMode) => void;

  /** True while assets are being loaded / parsed */
  loading: boolean;
  /** Non-empty string when loading failed; cleared on retry */
  error?: string;

  /** Global search query text (controlled by UI, consumed by core filter) */
  searchQuery: string;
  onSearchChange: (query: string) => void;

  /** Filtered/full list of structure view-models for the active mode */
  structures: NeuroStructureView[];
  /** IDs of currently selected structures */
  selectedIds: string[];
  onToggleStructure: (id: string) => void;

  /** Available layers for the active mode */
  layers: NeuroLayerView[];
  onToggleLayer: (id: string) => void;
  /** undefined when the scene does not support per-layer opacity */
  onLayerOpacityChange?: (id: string, opacity: number) => void;

  /** Camera / selection actions (wired to 3D core by host) */
  onIsolateSelection: () => void;
  onClearSelection: () => void;
  onFocusSelection: () => void;
  onResetView: () => void;

  /** Retry loading after an error */
  onRetry?: () => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export const NEURO_MODE_META: Record<NeuroMode, { label: string; description: string }> = {
  'nervous-system': {
    label: 'Whole Nervous System',
    description: 'Full-body brain, spinal cord and peripheral nerves.',
  },
  'brain-atlas': {
    label: 'Brain Atlas',
    description: 'Detailed selectable brain structures and regions.',
  },
  'neuron-lab': {
    label: 'Neuron Lab',
    description: 'Microscopic-scale illustrative neuron view.',
  },
};
