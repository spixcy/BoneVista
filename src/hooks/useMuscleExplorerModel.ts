import { useCallback, useMemo } from 'react';
import { toMuscleExplorerViewModels, toStoreStructureId } from '../data/muscleAtlas';
import { useAppStore } from '../store/appStore';

export interface MuscleExplorerUIModel {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage?: string;
  activePreset: 'bones' | 'superficial' | 'deep' | 'combined';
  query: string;
  structures: ReturnType<typeof toMuscleExplorerViewModels>;
  selectedIds: readonly string[];
  onQueryChange(query: string): void;
  onPresetChange(preset: 'bones' | 'superficial' | 'deep' | 'combined'): void;
  onSelectStructure(id: string): void;
  onSetStructureVisibility(id: string, visible: boolean): void;
  onIsolateSelected(): void;
  onClearSelection(): void;
  onRetryLoad(): void;
  onReturnToBones(): void;
}

/** Adapts the single shared app store to the standalone Muscle Explorer view contract. */
export function useMuscleExplorerModel(): MuscleExplorerUIModel {
  const state = useAppStore();
  const structures = useMemo(() => toMuscleExplorerViewModels(
    state.musclePreset,
    state.anatomyStructures,
    state.muscleStructures,
    state.selectedBones,
    state.hiddenBones,
  ), [state.musclePreset, state.anatomyStructures, state.muscleStructures, state.selectedBones, state.hiddenBones]);

  const onSelectStructure = useCallback((id: string) => {
    const storeId = toStoreStructureId(id);
    state.toggleBoneSelection(storeId);
  }, [state.toggleBoneSelection]);
  const onSetStructureVisibility = useCallback((id: string, visible: boolean) => {
    const storeId = toStoreStructureId(id);
    const isHidden = state.hiddenBones.has(storeId);
    if (visible === isHidden) state.toggleBoneVisibility(storeId);
  }, [state.hiddenBones, state.toggleBoneVisibility]);
  const onIsolateSelected = useCallback(() => state.setIsolationMode(true), [state.setIsolationMode]);
  const onReturnToBones = useCallback(() => {
    state.clearMuscleSelection();
    state.setMusclePreset('bones');
  }, [state.clearMuscleSelection, state.setMusclePreset]);

  return {
    status: state.muscleStatus,
    ...(state.muscleError ? { errorMessage: state.muscleError } : {}),
    activePreset: state.musclePreset,
    query: state.muscleQuery,
    structures,
    selectedIds: structures.filter((item) => item.selected).map((item) => item.id),
    onQueryChange: state.setMuscleQuery,
    onPresetChange: state.setMusclePreset,
    onSelectStructure,
    onSetStructureVisibility,
    onIsolateSelected,
    onClearSelection: state.clearBoneSelection,
    onRetryLoad: state.retryMuscleAtlas,
    onReturnToBones,
  };
}
