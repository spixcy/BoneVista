/**
 * BoneVista Neuro & Brain Explorer — Mode Tabs
 *
 * Owner: Antigravity Flash High (UI/presentation)
 */

import React from 'react';
import type { NeuroMode } from './types';
import { NEURO_MODE_META } from './types';
import styles from './NeuroModeTabs.module.css';

interface NeuroModeTabsProps {
  activeMode: NeuroMode;
  onModeChange: (mode: NeuroMode) => void;
  modes?: NeuroMode[];
}

const MODES: NeuroMode[] = ['nervous-system', 'brain-atlas'];

export const NeuroModeTabs: React.FC<NeuroModeTabsProps> = ({ activeMode, onModeChange, modes = MODES }) => {
  return (
    <div
      className={styles.tabBar}
      role="tablist"
      aria-label="Anatomy exploration modes"
    >
      {modes.map((mode) => {
        const meta = NEURO_MODE_META[mode];
        const isActive = activeMode === mode;
        return (
          <button
            key={mode}
            role="tab"
            aria-selected={isActive}
            aria-controls={`neuro-panel-${mode}`}
            id={`neuro-tab-${mode}`}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onModeChange(mode)}
            title={meta.description}
          >
            <ModeIcon mode={mode} />
            <span className={styles.tabLabel}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};

function ModeIcon({ mode }: { mode: NeuroMode }) {
  switch (mode) {
    case 'nervous-system':
      return (
        <svg className={styles.tabIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"/>
          <line x1="12" y1="15" x2="12" y2="22"/>
          <line x1="9" y1="18" x2="15" y2="18"/>
        </svg>
      );
    case 'brain-atlas':
      return (
        <svg className={styles.tabIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.79-2.9 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.27-1.33Z"/>
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.79-2.9 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.27-1.33Z"/>
        </svg>
      );
  }
}

export default NeuroModeTabs;
