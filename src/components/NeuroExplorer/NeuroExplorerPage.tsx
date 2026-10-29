/**
 * BoneVista Neuro & Brain Explorer — Full page shell
 *
 * Lays out the neuro interactive scene area (left) and the NeuroExplorerPanel (right),
 * matching the existing viewer/muscle-explorer page layout in BoneVista.
 *
 * The real WebGL viewport displays the brain and nervous system models.
 */

import React from 'react';
import NeuroViewport3D from './NeuroViewport3D';
import NeuroExplorerPanel from './NeuroExplorerPanel';
import { useNeuroExplorerModel } from '../../hooks/useNeuroExplorerModel';
import { useAppStore } from '../../store/appStore';
import { useWorkspaceVisible } from '../../hooks/useWorkspaceVisible';
import styles from './NeuroExplorerPage.module.css';

const NeuroExplorerPage: React.FC = () => {
  // All model/state wiring — Codex will inject real camera callbacks here
  const model = useNeuroExplorerModel();
  const hiddenIds = useAppStore((state) => state.hiddenNeuroStructures);
  const activePage = useAppStore((state) => state.activePage);
  const toggleStructureVisibility = useAppStore((state) => state.toggleNeuroStructureVisibility);
  const workspaceVisible = useWorkspaceVisible();

  return (
    <div className={styles.page} data-testid="neuro-explorer-page">
      {/* ── 3D scene area ────────────────────────────────────────────────
          Interactive presentation viewport; Codex will bridge WebGL canvas here.
          ─────────────────────────────────────────────────────────────── */}
      <div className={styles.sceneWrap}>
        <NeuroViewport3D active={workspaceVisible} />
      </div>

      {/* ── Right panel ──────────────────────────────────────────────── */}
      <div className={styles.panelWrap}>
        <NeuroExplorerPanel
          {...model}
          hiddenIds={hiddenIds}
          onToggleStructureVisibility={toggleStructureVisibility}
          availableModes={activePage === 'brain' ? ['brain-atlas'] : ['nervous-system']}
          sectionTitle={activePage === 'brain' ? 'BRAIN ANATOMY' : 'NEURO EXPLORER'}
        />
      </div>
    </div>
  );
};

export default NeuroExplorerPage;
