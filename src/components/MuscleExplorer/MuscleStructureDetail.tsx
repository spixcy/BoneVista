import React from 'react';
import { Eye, EyeOff, Layers, Bone, Activity, Info } from 'lucide-react';
import type { MuscleExplorerStructureVM } from './types';
import styles from './MuscleStructureDetail.module.css';

export interface MuscleStructureDetailProps {
  /** The structure to inspect, or null/undefined if none selected */
  structure?: MuscleExplorerStructureVM | null;
  /** Callback to toggle visibility for this structure */
  onToggleVisibility?: (id: string, visible: boolean) => void;
}

function formatSide(side: MuscleExplorerStructureVM['side']): string {
  switch (side) {
    case 'left': return 'Left (Sinister)';
    case 'right': return 'Right (Dexter)';
    case 'midline': return 'Midline';
    case 'bilateral': return 'Bilateral';
    default: return 'Unknown orientation';
  }
}

export const MuscleStructureDetail: React.FC<MuscleStructureDetailProps> = ({
  structure,
  onToggleVisibility,
}) => {
  if (!structure) {
    return (
      <div className={styles.emptyState} role="status">
        <p>Select an anatomical structure from the 3D model or list to inspect verified atlas details.</p>
      </div>
    );
  }

  const isMuscle = structure.kind === 'muscle';

  return (
    <article className={styles.detailCard} aria-label={`Details for ${structure.name}`}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <h4 className={styles.title}>{structure.name}</h4>
          {structure.latinName && <span className={styles.latin}>{structure.latinName}</span>}
        </div>
        {onToggleVisibility && (
          <button
            type="button"
            className={`${styles.visibilityToggle} ${!structure.visible ? styles.hidden : ''}`}
            onClick={() => onToggleVisibility(structure.id, !structure.visible)}
            title={structure.visible ? `Hide ${structure.name} in viewport` : `Show ${structure.name} in viewport`}
            aria-label={structure.visible ? `Hide ${structure.name}` : `Show ${structure.name}`}
          >
            {structure.visible ? <Eye size={13} aria-hidden="true" /> : <EyeOff size={13} aria-hidden="true" />}
          </button>
        )}
      </div>

      <div className={styles.chipGrid}>
        <span
          className={`${styles.chip} ${isMuscle ? styles.chipKindMuscle : styles.chipKindBone}`}
        >
          {isMuscle ? <Activity size={10} aria-hidden="true" /> : <Bone size={10} aria-hidden="true" />}
          {isMuscle ? 'Muscle' : 'Bone'}
        </span>

        {structure.layer && (
          <span className={`${styles.chip} ${styles.chipLayer}`}>
            <Layers size={10} aria-hidden="true" />
            {structure.layer === 'superficial' ? 'Superficial layer' : 'Deep layer'}
          </span>
        )}

        <span className={styles.chip}>
          {formatSide(structure.side)}
        </span>
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Region</span>
          <span className={styles.metaValue} title={structure.region || 'Unspecified'}>
            {structure.region || 'Unspecified'}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Meshes</span>
          <span className={styles.metaValue}>
            {structure.meshCount} {structure.meshCount === 1 ? 'mesh' : 'meshes'}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Identifier</span>
          <span className={styles.metaValue} title={structure.fmaId || structure.id}>
            {structure.fmaId ? `FMA ${structure.fmaId}` : structure.id}
          </span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Source</span>
          <span className={styles.metaValue} title={structure.source}>
            {structure.source}
          </span>
        </div>
      </div>

      <div className={styles.disclaimer} role="note">
        <Info size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
        Verified reference geometry. Origins, insertions, function, and innervation are not specified in the current model release and are not fabricated.
      </div>
    </article>
  );
};

export default MuscleStructureDetail;
