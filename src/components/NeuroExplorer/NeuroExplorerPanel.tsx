/**
 * BoneVista Neuro & Brain Explorer — Main Panel
 *
 * Composite right-hand panel: mode tabs, layer controls, viewport actions,
 * structure list, detail card, and all loading/error/empty states.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 *
 * Integration boundary:
 *   - All props come from NeuroExplorerViewProps (contract/types.ts).
 *   - No GLTF loading, Three.js, or selection-store logic lives here.
 *   - The 3D scene, manifests and state management are owned by Codex Luna High.
 */

import React, { useMemo } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import type { NeuroExplorerViewProps, NeuroMode, NeuroStructureView } from './types';
import { NEURO_MODE_META } from './types';
import NeuroModeTabs from './NeuroModeTabs';
import NeuroLayerControls from './NeuroLayerControls';
import NeuroViewportActions from './NeuroViewportActions';
import NeuroStructureList from './NeuroStructureList';
import NeuroStructureDetail from './NeuroStructureDetail';
import styles from './NeuroExplorerPanel.module.css';

interface NeuroExplorerPanelProps extends NeuroExplorerViewProps {
  /** Optional classname for outer wrapper */
  className?: string;
  /** Optional: hidden structure IDs from the 3D core (Codex wire-in) */
  hiddenIds?: Set<string>;
  onToggleStructureVisibility?: (id: string) => void;
  availableModes?: NeuroMode[];
  sectionTitle?: string;
}

export const NeuroExplorerPanel: React.FC<NeuroExplorerPanelProps> = ({
  activeMode,
  onModeChange,
  loading,
  error,
  searchQuery,
  onSearchChange,
  structures,
  selectedIds,
  onToggleStructure,
  layers,
  onToggleLayer,
  onLayerOpacityChange,
  onIsolateSelection,
  onClearSelection,
  onFocusSelection,
  onResetView,
  onRetry,
  className = '',
  hiddenIds,
  onToggleStructureVisibility,
  availableModes,
  sectionTitle = 'NEURO EXPLORER',
}) => {
  // Derive the first selected structure for the detail panel
  const selectedStructure = useMemo<NeuroStructureView | null>(() => {
    if (!selectedIds.length) return null;
    return structures.find((s) => selectedIds.includes(s.id)) ?? null;
  }, [structures, selectedIds]);

  const modeMeta = NEURO_MODE_META[activeMode];
  const isNeuronLab = activeMode === 'neuron-lab';

  return (
    <aside
      className={`${styles.panel} ${className}`}
      aria-label={`${sectionTitle} panel`}
      data-testid="neuro-explorer-panel"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>{sectionTitle}</span>
        <span className={styles.selectionCount}>
          {selectedIds.length} selected
        </span>
      </div>

      {/* ── Neuron Lab illustrative disclaimer ──────────────────── */}
      {isNeuronLab && (
        <div className={styles.disclaimerBanner} role="note">
          <span className={styles.disclaimerIcon} aria-hidden="true">★</span>
          <span>
            <strong>Illustrative neuron.</strong> This is a procedural/generated morphology,
            not a validated empirical reconstruction. Signal animations are educational only.
          </span>
        </div>
      )}

      {/* ── Mode tabs ───────────────────────────────────────────── */}
      <NeuroModeTabs activeMode={activeMode} onModeChange={onModeChange} modes={availableModes} />

      {/* ── Loading state ───────────────────────────────────────── */}
      {loading && (
        <div className={styles.statusContainer} role="status" aria-live="polite">
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <h4 className={styles.statusTitle}>
            Loading {modeMeta.label}
          </h4>
          <p className={styles.statusSubtext}>
            {isNeuronLab
              ? 'Generating illustrative neuron geometry…'
              : 'Preparing neuro anatomy assets and manifests…'}
          </p>
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────── */}
      {!loading && error && (
        <div className={styles.statusContainer} role="alert">
          <div className={styles.errorBox}>
            <AlertCircle size={28} className={styles.errorIcon} aria-hidden="true" />
            <h4 className={styles.statusTitle}>Failed to Load</h4>
            <p className={styles.errorMessage}>{error}</p>
            {onRetry && (
              <button
                type="button"
                className={styles.retryBtn}
                onClick={onRetry}
              >
                <RotateCcw size={11} aria-hidden="true" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Ready content ───────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {/* Layer controls */}
          <NeuroLayerControls
            layers={layers}
            onToggleLayer={onToggleLayer}
            onLayerOpacityChange={onLayerOpacityChange}
          />

          {/* Viewport action bar */}
          <NeuroViewportActions
            selectedCount={selectedIds.length}
            onIsolateSelection={onIsolateSelection}
            onClearSelection={onClearSelection}
            onFocusSelection={onFocusSelection}
            onResetView={onResetView}
          />

          {/* Structure list — fills available space */}
          <NeuroStructureList
            query={searchQuery}
            structures={structures}
            selectedIds={selectedIds}
            onSearchChange={onSearchChange}
            onToggleStructure={onToggleStructure}
            hiddenIds={hiddenIds}
            onToggleVisibility={onToggleStructureVisibility}
          />

          {/* Detail panel — selected structure metadata */}
          <NeuroStructureDetail structure={selectedStructure} />

          {/* Footer */}
          <div className={styles.footer}>
            Anatomical reference · Educational use only
          </div>
        </>
      )}
    </aside>
  );
};

export default NeuroExplorerPanel;
