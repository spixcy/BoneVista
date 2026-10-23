import React from 'react';
import { useAppStore } from '../../store/appStore';
import { useMuscleExplorerModel } from '../../hooks/useMuscleExplorerModel';
import MuscleLayerControls from './MuscleLayerControls';
import MuscleStructureDetail from './MuscleStructureDetail';

/** Connects Antigravity's presentation components to BoneVista's shared atlas state. */
const MuscleExplorerHost: React.FC = () => {
  const model = useMuscleExplorerModel();
  const setActivePage = useAppStore((state) => state.setActivePage);
  const selected = model.structures.find((structure) => structure.selected) ?? null;

  return <section aria-label="Muscle Explorer" data-testid="muscle-explorer-host">
    <MuscleLayerControls
      activePreset={model.activePreset}
      selectedCount={model.selectedIds.length}
      visibleCount={model.structures.filter((structure) => structure.visible).length}
      totalCount={model.structures.length}
      onPresetChange={model.onPresetChange}
      onIsolateSelected={model.onIsolateSelected}
      onClearSelection={model.onClearSelection}
      onReturnToBones={() => { model.onReturnToBones(); setActivePage('viewer'); }}
      disabled={model.status === 'loading'}
    />
    {model.status === 'loading' && <div role="status" aria-live="polite">Loading the local muscle atlas…</div>}
    {model.status === 'error' && <div role="alert">
      <p>{model.errorMessage ?? 'The local muscle atlas could not be loaded.'}</p>
      <button type="button" onClick={model.onRetryLoad}>Retry muscle atlas</button>
      <button type="button" onClick={model.onReturnToBones}>Return to Bones</button>
    </div>}
    {model.status === 'ready' && <MuscleStructureDetail structure={selected} onToggleVisibility={model.onSetStructureVisibility} />}
  </section>;
};

export default MuscleExplorerHost;
