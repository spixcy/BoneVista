/**
 * BoneVista Neuro & Brain Explorer — Viewport Action Bar
 *
 * Selection count badge + isolate / clear / focus / reset controls.
 * Uses the same icon style as the existing ViewerToolbar.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 */

import React from 'react';
import { Target, X, Maximize2, RotateCcw } from 'lucide-react';
import styles from './NeuroViewportActions.module.css';

interface NeuroViewportActionsProps {
  selectedCount: number;
  onIsolateSelection: () => void;
  onClearSelection: () => void;
  onFocusSelection: () => void;
  onResetView: () => void;
}

export const NeuroViewportActions: React.FC<NeuroViewportActionsProps> = ({
  selectedCount,
  onIsolateSelection,
  onClearSelection,
  onFocusSelection,
  onResetView,
}) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className={styles.bar} aria-label="Viewport actions">
      {/* Selection count badge */}
      <span
        className={`${styles.badge} ${hasSelection ? styles.badgeActive : ''}`}
        aria-live="polite"
        aria-label={`${selectedCount} structure${selectedCount !== 1 ? 's' : ''} selected`}
      >
        {selectedCount}
      </span>

      {/* Isolate */}
      <button
        type="button"
        className={styles.actionBtn}
        onClick={onIsolateSelection}
        disabled={!hasSelection}
        aria-label="Isolate selected structures"
        title="Isolate selected"
      >
        <Maximize2 size={13} aria-hidden="true" />
      </button>

      {/* Focus / fit to selection */}
      <button
        type="button"
        className={styles.actionBtn}
        onClick={onFocusSelection}
        disabled={!hasSelection}
        aria-label="Focus camera on selected structures"
        title="Focus selection"
      >
        <Target size={13} aria-hidden="true" />
      </button>

      {/* Clear selection */}
      <button
        type="button"
        className={styles.actionBtn}
        onClick={onClearSelection}
        disabled={!hasSelection}
        aria-label="Clear selection"
        title="Clear selection"
      >
        <X size={13} aria-hidden="true" />
      </button>

      <div className={styles.divider} aria-hidden="true" />

      {/* Reset view */}
      <button
        type="button"
        className={styles.actionBtn}
        onClick={onResetView}
        aria-label="Reset camera view"
        title="Reset view"
      >
        <RotateCcw size={13} aria-hidden="true" />
      </button>
    </div>
  );
};

export default NeuroViewportActions;
