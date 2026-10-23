/**
 * BoneVista Neuro & Brain Explorer — Structure Detail Panel
 *
 * Shows metadata for the currently selected structure.
 * Displays only information provided by the core; never invents anatomy.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 */

import React from 'react';
import type { NeuroStructureView } from './types';
import styles from './NeuroStructureDetail.module.css';

interface NeuroStructureDetailProps {
  structure: NeuroStructureView | null;
}

export const NeuroStructureDetail: React.FC<NeuroStructureDetailProps> = ({ structure }) => {
  if (!structure) {
    return (
      <div className={styles.empty}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={styles.emptyIcon}
        >
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.79-2.9 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.27-1.33Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.79-2.9 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.27-1.33Z" />
        </svg>
        <p>Select a structure to see its details.</p>
      </div>
    );
  }

  return (
    <div className={styles.detail} aria-label={`Details for ${structure.name}`}>
      <div className={styles.nameBlock}>
        <span className={styles.name}>{structure.name}</span>
        {structure.latinName && (
          <span className={styles.latinName}>{structure.latinName}</span>
        )}
      </div>

      <dl className={styles.metaList}>
        {structure.category && (
          <DetailRow label="Category" value={structure.category} />
        )}
        {structure.region && (
          <DetailRow label="Region" value={structure.region} />
        )}
        {structure.side && structure.side !== 'unknown' && (
          <DetailRow
            label="Side"
            value={
              structure.side === 'left'
                ? 'Left'
                : structure.side === 'right'
                ? 'Right'
                : structure.side === 'midline'
                ? 'Midline'
                : structure.side
            }
          />
        )}
        {structure.source && (
          <DetailRow label="Source" value={structure.source} />
        )}
        {!structure.selectable && (
          <dt className={styles.metaLabel}>Status</dt>
        )}
        {!structure.selectable && (
          <dd className={styles.metaValue}>
            <span className={styles.metaOnlyBadge}>Metadata only — no 3D mesh</span>
          </dd>
        )}
      </dl>

      {structure.description && (
        <p className={styles.description}>{structure.description}</p>
      )}
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <>
    <dt className={styles.metaLabel}>{label}</dt>
    <dd className={styles.metaValue}>{value}</dd>
  </>
);

export default NeuroStructureDetail;
