import React, { useMemo } from 'react';
import { AlertCircle, RotateCcw, Undo2 } from 'lucide-react';
import type { MuscleExplorerUIModel } from './types';
import MuscleLayerControls from './MuscleLayerControls';
import MuscleStructureList from './MuscleStructureList';
import MuscleStructureDetail from './MuscleStructureDetail';
import styles from './MuscleExplorerPanel.module.css';

export interface MuscleExplorerPanelProps extends MuscleExplorerUIModel {
  /** Optional custom class name */
  className?: string;
  /** Optional title override */
  title?: string;
}

export const MuscleExplorerPanel: React.FC<MuscleExplorerPanelProps> = ({
  status,
  errorMessage,
  activePreset,
  query,
  structures,
  selectedIds,
  onQueryChange,
  onPresetChange,
  onSelectStructure,
  onSetStructureVisibility,
  onIsolateSelected,
  onClearSelection,
  onRetryLoad,
  onReturnToBones,
  className = '',
  title = 'Muscle Explorer',
}) => {
  // Find currently inspected structure (selected or first in selectedIds)
  const activeStructure = useMemo(() => {
    if (!selectedIds.length) return null;
    return structures.find((s) => s.id === selectedIds[0] || s.selected) || null;
  }, [structures, selectedIds]);

  const visibleCount = useMemo(() => {
    return structures.filter((s) => s.visible).length;
  }, [structures]);

  return (
    <aside
      className={`${styles.panel} ${className}`}
      aria-label="Muscle Explorer Workspace Panel"
      data-testid="muscle-explorer-panel"
    >
      <div className={styles.header}>
        <span className={styles.headerTitle}>{title}</span>
        <span className={styles.selectionCount}>
          {selectedIds.length} selected
        </span>
      </div>

      {status === 'loading' && (
        <div className={styles.statusContainer} role="status" aria-live="polite">
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <h4 className={styles.loadingTitle}>Loading Muscle Anatomy</h4>
          <p className={styles.loadingSubtext}>
            Preparing segmented muscles, layer registry, and 3D geometry…
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.statusContainer} role="alert">
          <div className={styles.errorBox}>
            <AlertCircle size={28} className={styles.errorIcon} aria-hidden="true" />
            <h4 className={styles.errorTitle}>Failed to Load Muscles</h4>
            <p className={styles.errorMessage}>
              {errorMessage || 'The muscle asset or metadata could not be loaded.'}
            </p>
            <div className={styles.errorActions}>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={onRetryLoad}
                title="Re-attempt loading muscle model"
              >
                <RotateCcw size={12} aria-hidden="true" />
                Retry
              </button>
              <button
                type="button"
                className={styles.returnBtn}
                onClick={onReturnToBones}
                title="Return to standard reference skeleton view"
              >
                <Undo2 size={12} aria-hidden="true" />
                Bones view
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'idle' && (
        <div className={styles.statusContainer} role="status">
          <h4 className={styles.loadingTitle}>Muscle Explorer Standby</h4>
          <p className={styles.loadingSubtext}>
            Select a muscle layer preset above to initialize the muscular anatomy view.
          </p>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => onPresetChange('superficial')}
          >
            Load superficial muscles
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <MuscleLayerControls
            activePreset={activePreset}
            selectedCount={selectedIds.length}
            visibleCount={visibleCount}
            totalCount={structures.length}
            onPresetChange={onPresetChange}
            onIsolateSelected={onIsolateSelected}
            onClearSelection={onClearSelection}
            onReturnToBones={onReturnToBones}
          />

          <MuscleStructureList
            query={query}
            structures={structures}
            onQueryChange={onQueryChange}
            onSelectStructure={onSelectStructure}
            onSetStructureVisibility={onSetStructureVisibility}
          />

          <MuscleStructureDetail
            structure={activeStructure}
            onToggleVisibility={onSetStructureVisibility}
          />

          <div className={styles.footer}>
            Segmented anatomical reference · Educational use only
          </div>
        </>
      )}
    </aside>
  );
};

export default MuscleExplorerPanel;
