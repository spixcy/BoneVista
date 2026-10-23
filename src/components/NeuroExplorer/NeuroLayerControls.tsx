/**
 * BoneVista Neuro & Brain Explorer — Layer Controls
 *
 * Renders toggle switches and optional opacity sliders for each available
 * layer in the active neuro mode.  Unavailable layers are shown as disabled.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 */

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { NeuroLayerView } from './types';
import styles from './NeuroLayerControls.module.css';

interface NeuroLayerControlsProps {
  layers: NeuroLayerView[];
  onToggleLayer: (id: string) => void;
  onLayerOpacityChange?: (id: string, opacity: number) => void;
}

export const NeuroLayerControls: React.FC<NeuroLayerControlsProps> = ({
  layers,
  onToggleLayer,
  onLayerOpacityChange,
}) => {
  if (layers.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Layer visibility controls">
      <span className={styles.sectionLabel}>LAYERS</span>
      <ul className={styles.list} role="list">
        {layers.map((layer) => (
          <li key={layer.id} className={styles.row}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${layer.visible ? styles.toggleOn : ''} ${!layer.available ? styles.unavailable : ''}`}
              onClick={() => layer.available && onToggleLayer(layer.id)}
              disabled={!layer.available}
              aria-pressed={layer.visible}
              aria-label={`${layer.visible ? 'Hide' : 'Show'} ${layer.label}`}
              title={layer.available ? undefined : 'Layer not available in current model'}
            >
              {layer.visible
                ? <Eye size={11} aria-hidden="true" />
                : <EyeOff size={11} aria-hidden="true" />
              }
            </button>

            <span
              className={`${styles.layerLabel} ${!layer.available ? styles.labelUnavailable : ''}`}
            >
              {layer.label}
            </span>

            {!layer.available && (
              <span className={styles.badge} aria-label="Unavailable">—</span>
            )}

            {layer.available && onLayerOpacityChange && (
              <input
                type="range"
                className={styles.opacitySlider}
                min={0}
                max={1}
                step={0.05}
                value={layer.opacity}
                aria-label={`${layer.label} opacity`}
                onChange={(e) =>
                  onLayerOpacityChange(layer.id, parseFloat(e.target.value))
                }
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default NeuroLayerControls;
