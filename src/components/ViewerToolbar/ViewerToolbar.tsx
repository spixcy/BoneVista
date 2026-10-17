import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff,
  Focus, RefreshCcw, Layers, Sun, Zap, Scan
} from 'lucide-react';
import { useAppStore, ViewMode, AnatomicalView } from '../../store/appStore';
import styles from './ViewerToolbar.module.css';

const viewModes: { id: ViewMode; label: string; icon: LucideIcon }[] = [
  { id: 'bone',   label: 'Bone',   icon: Layers },
  { id: 'stress', label: 'Stress', icon: Zap },
  { id: 'xray',   label: 'X-Ray',  icon: Scan },
];

const anatomicalViews: { id: AnatomicalView; label: string }[] = [
  { id: 'anterior',   label: 'Ant' },
  { id: 'posterior',  label: 'Post' },
  { id: 'lateral-l',  label: 'Lat L' },
  { id: 'lateral-r',  label: 'Lat R' },
  { id: 'superior',   label: 'Sup' },
  { id: 'inferior',   label: 'Inf' },
];

const ViewerToolbar: React.FC = () => {
  const {
    viewMode, setViewMode,
    setActivePage,
    anatomicalView, setAnatomicalView,
    selectedBones, clearBoneSelection,
    isolationMode, setIsolationMode,
    isRotating, setIsRotating,
  } = useAppStore();
  const selectedMode = viewMode;

  return (
    <div className={styles.toolbar}>
      {/* View mode tabs */}
      <div className={styles.group}>
        <span className="mono-label">View</span>
        <div className={styles.tabs} role="tablist" aria-label="View mode">
          {viewModes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={selectedMode === id}
              className={`${styles.tab} ${selectedMode === id ? styles.tabActive : ''}`}
              onClick={() => {
                setViewMode(id);
                setActivePage('viewer');
              }}
              title={id === 'stress' ? 'Open the educational 1D axial finite-element simulation' : id === 'xray' ? 'Open the local radiograph viewer' : 'Return to the 3D anatomy viewer'}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Anatomical view presets */}
      <div className={styles.group}>
        <span className="mono-label">Orient</span>
        <div className={styles.tabs} role="tablist" aria-label="Anatomical orientation">
          {anatomicalViews.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={anatomicalView === id}
              className={`${styles.tab} ${anatomicalView === id ? styles.tabActive : ''}`}
              onClick={() => setAnatomicalView(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.iconBtn} ${isRotating ? styles.iconBtnActive : ''}`}
          onClick={() => setIsRotating(!isRotating)}
          aria-label="Toggle auto-rotate"
          title="Auto-rotate"
        >
          <RotateCcw size={16} />
        </button>

        <button
          className={`${styles.iconBtn} ${isolationMode ? styles.iconBtnActive : ''}`}
          onClick={() => setIsolationMode(!isolationMode)}
          aria-label="Isolation mode"
          title="Isolate selected"
          disabled={selectedBones.size === 0}
        >
          <Focus size={16} />
        </button>

        <button
          className={styles.iconBtn}
          onClick={clearBoneSelection}
          aria-label="Clear selection"
          title="Clear selection"
          disabled={selectedBones.size === 0}
        >
          <RefreshCcw size={16} />
        </button>
      </div>

      {/* Selection badge */}
      <AnimatePresence>
        {selectedBones.size > 0 && (
          <motion.div
            className={styles.selectionBadge}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {selectedBones.size} selected
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ViewerToolbar;

