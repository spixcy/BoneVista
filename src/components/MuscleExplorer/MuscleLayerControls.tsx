import React from 'react';
import { Bone, Layers, Activity, Sparkles, Focus, RotateCcw, Undo2 } from 'lucide-react';
import type { MuscleLayerPreset } from './types';
import styles from './MuscleLayerControls.module.css';

export interface MuscleLayerControlsProps {
  /** Currently active layer preset */
  activePreset: MuscleLayerPreset;
  /** Number of currently selected structures */
  selectedCount: number;
  /** Total count of visible structures */
  visibleCount?: number;
  /** Total structures available */
  totalCount?: number;
  /** Callback when user changes layer preset */
  onPresetChange(preset: MuscleLayerPreset): void;
  /** Callback to isolate currently selected structures */
  onIsolateSelected(): void;
  /** Callback to clear all active selections */
  onClearSelection(): void;
  /** Callback to return to standard Bones view */
  onReturnToBones(): void;
  /** Optional disabled state */
  disabled?: boolean;
}

const PRESETS: Array<{
  id: MuscleLayerPreset;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
}> = [
  {
    id: 'bones',
    label: 'Bones',
    sublabel: 'Skeleton',
    icon: Bone,
    title: 'Show skeletal foundation only (reference model)',
  },
  {
    id: 'superficial',
    label: 'Superficial',
    sublabel: 'Outer',
    icon: Layers,
    title: 'Show superficial muscle layer',
  },
  {
    id: 'deep',
    label: 'Deep',
    sublabel: 'Intrinsic',
    icon: Activity,
    title: 'Show deep muscle layer',
  },
  {
    id: 'combined',
    label: 'Combined',
    sublabel: 'Bones+Muscles',
    icon: Sparkles,
    title: 'Show aligned skeleton and muscles together',
  },
];

export const MuscleLayerControls: React.FC<MuscleLayerControlsProps> = ({
  activePreset,
  selectedCount,
  visibleCount,
  totalCount,
  onPresetChange,
  onIsolateSelected,
  onClearSelection,
  onReturnToBones,
  disabled = false,
}) => {
  return (
    <div className={styles.controls} role="region" aria-label="Muscle Layer Controls">
      <div className={styles.topRow}>
        <span className={styles.label}>Anatomy Layers</span>
        {typeof visibleCount === 'number' && typeof totalCount === 'number' && (
          <span className={styles.metaStats} title="Visible structures / Total in layer">
            {visibleCount}/{totalCount} visible
          </span>
        )}
      </div>

      <div className={styles.presetTabs} role="tablist" aria-label="Anatomical layer presets">
        {PRESETS.map(({ id, label, sublabel, icon: Icon, title }) => {
          const isActive = activePreset === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-label={`${label} layer (${sublabel})`}
              title={title}
              disabled={disabled}
              className={`${styles.presetTab} ${isActive ? styles.presetTabActive : ''}`}
              onClick={() => onPresetChange(id)}
            >
              <span className={styles.tabIcon} aria-hidden="true">
                <Icon size={14} />
              </span>
              <span className={styles.tabLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actionsRow}>
        <div className={styles.selectionActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onIsolateSelected}
            disabled={disabled || selectedCount === 0}
            title={selectedCount > 0 ? `Isolate ${selectedCount} selected structure(s)` : 'Select a structure to isolate'}
            aria-label="Isolate selected structures"
          >
            <Focus size={12} aria-hidden="true" />
            <span>Isolate</span>
            {selectedCount > 0 && <span className={styles.badge}>{selectedCount}</span>}
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={onClearSelection}
            disabled={disabled || selectedCount === 0}
            title="Clear all active selections"
            aria-label="Clear selection"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>

        {activePreset !== 'bones' && (
          <button
            type="button"
            className={styles.returnBonesButton}
            onClick={onReturnToBones}
            disabled={disabled}
            title="Return to standard reference skeleton view"
            aria-label="Return to Bones view"
          >
            <Undo2 size={12} aria-hidden="true" />
            <span>Bones view</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MuscleLayerControls;
