/**
 * BoneVista Muscle Explorer — Types
 *
 * Implements the shared UI/data contract defined in
 * docs/MUSCLE_EXPLORER_PARALLEL_AGENT_CONTRACT.md (Section 3).
 */

export type MuscleLayerPreset =
  | 'bones'
  | 'superficial'
  | 'deep'
  | 'combined';

export type MuscleExplorerStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AnatomySide = 'left' | 'right' | 'midline' | 'bilateral' | 'unknown';

export type MuscleLayer = 'superficial' | 'deep';

export interface MuscleExplorerStructureVM {
  /** Stable, namespaced identifier (e.g. `muscle:FMA12345:left`, `bone:123`). Never an array index. */
  id: string;
  /** Primary common name in English */
  name: string;
  /** Formal Latin anatomical name (e.g. TA2 / Terminologia Anatomica) */
  latinName?: string;
  /** Anatomical category */
  kind: 'bone' | 'muscle';
  /** Muscular layer depth, meaningful when kind === 'muscle' */
  layer?: MuscleLayer;
  /** Bilateral / midline anatomical orientation */
  side: AnatomySide;
  /** Anatomical body region (e.g. 'Head and neck', 'Thorax', 'Upper limb') */
  region?: string;
  /** Provenance source identifier (e.g. 'Écorché', 'Z-Anatomy') */
  source: string;
  /** Foundational Model of Anatomy identifier when verified */
  fmaId?: string;
  /** Number of individual meshes associated with this grouped structure */
  meshCount: number;
  /** Visibility toggle state in 3D viewport */
  visible: boolean;
  /** Selection focus state */
  selected: boolean;
}

export interface MuscleExplorerUIModel {
  /** Current asynchronous loading lifecycle state */
  status: MuscleExplorerStatus;
  /** Descriptive error message when status === 'error' */
  errorMessage?: string;
  /** Currently active layer preset */
  activePreset: MuscleLayerPreset;
  /** Current text query filtering the structure list */
  query: string;
  /** Complete or filtered list of structure view-models */
  structures: readonly MuscleExplorerStructureVM[];
  /** IDs of currently selected structures */
  selectedIds: readonly string[];

  /** Callback when user changes the search input */
  onQueryChange(query: string): void;
  /** Callback when user selects a layer preset */
  onPresetChange(preset: MuscleLayerPreset): void;
  /** Callback when user clicks to select/deselect a structure */
  onSelectStructure(id: string): void;
  /** Callback when user toggles visibility for a structure */
  onSetStructureVisibility(id: string, visible: boolean): void;
  /** Callback to isolate currently selected structures in viewport */
  onIsolateSelected(): void;
  /** Callback to clear all active selections */
  onClearSelection(): void;
  /** Callback to re-attempt loading when status === 'error' */
  onRetryLoad(): void;
  /** Callback to safely return to standard Bones view */
  onReturnToBones(): void;
}
