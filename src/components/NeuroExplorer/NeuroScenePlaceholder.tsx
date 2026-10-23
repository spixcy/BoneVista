/**
 * BoneVista Neuro & Brain Explorer — Interactive Viewport Shell
 *
 * Interactive presentation viewport providing mode-specific visual representations,
 * selection synchronization, layer visibility, pan/zoom, fit-to-view, and an
 * illustrative signal path animation for the Neuron Lab mode.
 *
 * Designed to seamlessly receive and bridge to Codex Luna High's WebGL 3D meshes.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 * 3D scene/asset loader integration: Codex Luna High
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Play, Pause, Activity } from 'lucide-react';
import type { NeuroMode, NeuroStructureView, NeuroLayerView } from './types';
import { NEURO_MODE_META } from './types';
import styles from './NeuroScenePlaceholder.module.css';

interface NeuroScenePlaceholderProps {
  activeMode: NeuroMode;
  loading: boolean;
  error?: string;
  structures?: NeuroStructureView[];
  selectedIds?: string[];
  onToggleStructure?: (id: string) => void;
  layers?: NeuroLayerView[];
  onResetView?: () => void;
}

export const NeuroScenePlaceholder: React.FC<NeuroScenePlaceholderProps> = ({
  activeMode,
  loading,
  error,
  structures = [],
  selectedIds = [],
  onToggleStructure,
  layers = [],
  onResetView,
}) => {
  const meta = NEURO_MODE_META[activeMode];
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animating, setAnimating] = useState(true);
  const [pulsePos, setPulsePos] = useState(0);

  // Reset zoom & pan on mode switch
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [activeMode]);

  // Illustrative signal pulse animation for Neuron Lab
  useEffect(() => {
    if (activeMode !== 'neuron-lab' || !animating) return;
    const interval = setInterval(() => {
      setPulsePos((prev) => (prev + 0.015) % 1);
    }, 30);
    return () => clearInterval(interval);
  }, [activeMode, animating]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.min(Math.max(z * factor, 0.4), 3.0));
  };

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onResetView?.();
  }, [onResetView]);

  const isLayerVisible = useCallback((layerId: string): boolean => {
    const layer = layers.find(l => l.id === layerId);
    return layer ? layer.visible : true;
  }, [layers]);

  // Check if a given structure ID or alias is selected
  const isSelected = useCallback((idSubstring: string): boolean => {
    return selectedIds.some(id => id.toLowerCase().includes(idSubstring.toLowerCase()));
  }, [selectedIds]);

  const handleSelectSub = useCallback((sub: string) => {
    if (!onToggleStructure) return;
    const match = structures.find(s => s.id.toLowerCase().includes(sub.toLowerCase()) || s.name.toLowerCase().includes(sub.toLowerCase()));
    if (match) onToggleStructure(match.id);
  }, [structures, onToggleStructure]);

  return (
    <div
      className={styles.viewport}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      aria-label={`${meta.label} interactive anatomy viewport`}
      data-testid="neuro-scene-viewport"
    >
      {/* ── Viewport Header HUD ────────────────────────────────────── */}
      <div className={styles.hudTopLeft}>
        <span className={styles.hudMode}>{meta.label}</span>
        <span className={styles.hudScale}>
          {activeMode === 'nervous-system' && 'MACROSCOPIC SCALE · 1:1 HUMAN REFERENCE'}
          {activeMode === 'brain-atlas' && 'ORGAN SCALE · CEPHALIC REFERENCE'}
          {activeMode === 'neuron-lab' && 'MICROSCOPIC SCALE · CELLULAR SCHEMATIC'}
        </span>
      </div>

      <div className={styles.hudTopRight}>
        <div className={styles.controlsGroup}>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={() => setZoom((z) => Math.max(z * 0.8, 0.4))}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            className={styles.controlBtn}
            onClick={handleReset}
            aria-label="Reset and fit view"
            title="Fit to view"
          >
            <Maximize2 size={14} />
          </button>
          {activeMode === 'neuron-lab' && (
            <button
              type="button"
              className={`${styles.controlBtn} ${animating ? styles.controlBtnActive : ''}`}
              onClick={() => setAnimating((a) => !a)}
              aria-label={animating ? 'Pause signal animation' : 'Play signal animation'}
              title={animating ? 'Pause illustrative signal' : 'Play illustrative signal'}
            >
              {animating ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* ── Loading Overlay ────────────────────────────────────────── */}
      {loading && (
        <div className={styles.overlay} role="status">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Loading {meta.label}…</span>
        </div>
      )}

      {/* ── Error Overlay ──────────────────────────────────────────── */}
      {!loading && error && (
        <div className={`${styles.overlay} ${styles.errorOverlay}`} role="alert">
          <span className={styles.errorDot} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Transform Canvas ───────────────────────────────────────── */}
      <div
        className={styles.canvas}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: isDragging ? 'none' : 'transform 0.12s ease-out',
        }}
      >
        {activeMode === 'nervous-system' && (
          <WholeNervousSystemDiagram
            isLayerVisible={isLayerVisible}
            isSelected={isSelected}
            onSelect={handleSelectSub}
          />
        )}

        {activeMode === 'brain-atlas' && (
          <BrainAtlasDiagram
            isLayerVisible={isLayerVisible}
            isSelected={isSelected}
            onSelect={handleSelectSub}
          />
        )}

        {activeMode === 'neuron-lab' && (
          <NeuronLabDiagram
            isLayerVisible={isLayerVisible}
            isSelected={isSelected}
            onSelect={handleSelectSub}
            pulsePos={pulsePos}
          />
        )}
      </div>

      {/* ── Viewport Bottom HUD ─────────────────────────────────────── */}
      <div className={styles.hudBottom}>
        <div className={styles.sourceTag}>
          {activeMode === 'neuron-lab' ? (
            <span className={styles.illustrativeTag}>
              <Activity size={12} /> Illustrative schematic · Pending Neuron Lab branch integration
            </span>
          ) : (
            <span>Reference anatomy · Z-Anatomy / BodyParts3D · CC BY-SA 4.0</span>
          )}
        </div>
        <div className={styles.interactiveHint}>
          Click regions to select · Drag to pan · Scroll to zoom
        </div>
      </div>
    </div>
  );
};

// ─── 1. Whole Nervous System Diagram ──────────────────────────────────────────

interface DiagramProps {
  isLayerVisible: (layerId: string) => boolean;
  isSelected: (idSubstring: string) => boolean;
  onSelect: (idSubstring: string) => void;
}

function WholeNervousSystemDiagram({ isLayerVisible, isSelected, onSelect }: DiagramProps) {
  const cnsVis = isLayerVisible('layer:system:cns');
  const cranialVis = isLayerVisible('layer:system:cranial');
  const spinalVis = isLayerVisible('layer:system:spinal');
  const autoVis = isLayerVisible('layer:system:autonomic');

  return (
    <svg className={styles.diagramSvg} viewBox="0 0 500 700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7da2ff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7da2ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sympathetic Trunk (Autonomic) */}
      {autoVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('sympathetic') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('sympathetic')}
        >
          <line x1="240" y1="180" x2="240" y2="440" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 4" opacity="0.8" />
          <line x1="260" y1="180" x2="260" y2="440" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3 4" opacity="0.8" />
          {[190, 230, 270, 310, 350, 390, 430].map(y => (
            <React.Fragment key={y}>
              <circle cx="240" cy={y} r="3" fill="#f59e0b" />
              <circle cx="260" cy={y} r="3" fill="#f59e0b" />
            </React.Fragment>
          ))}
          <title>Sympathetic Trunk (Autonomic Division)</title>
        </g>
      )}

      {/* Central Nervous System: Brain & Spinal Cord */}
      {cnsVis && (
        <g>
          {/* Brain Head Outline & Hemispheres */}
          <g
            className={`${styles.diagramElement} ${isSelected('brain') || isSelected('cerebrum') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('brain')}
          >
            <circle cx="250" cy="80" r="48" fill="url(#brainGlow)" />
            <path
              d="M 250 36 C 220 36 208 55 208 85 C 208 115 228 126 244 128 L 244 140 L 256 140 L 256 128 C 272 126 292 115 292 85 C 292 55 280 36 250 36 Z"
              fill="rgba(125,162,255,0.18)"
              stroke="#7da2ff"
              strokeWidth="2.5"
            />
            <path d="M 250 40 Q 248 85 250 128" stroke="#7da2ff" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6" />
            <title>Central Nervous System: Brain (Cerebrum)</title>
          </g>

          {/* Spinal Cord */}
          <g
            className={`${styles.diagramElement} ${isSelected('spinal_cord') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('spinal_cord')}
          >
            <rect x="246" y="132" width="8" height="320" rx="4" fill="rgba(125,162,255,0.4)" stroke="#7da2ff" strokeWidth="2" />
            <title>Central Nervous System: Spinal Cord (Medulla spinalis)</title>
          </g>
        </g>
      )}

      {/* Cranial Nerves */}
      {cranialVis && (
        <g>
          {/* Optic & Olfactory */}
          <g
            className={`${styles.diagramElement} ${isSelected('optic') || isSelected('olfactory') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('optic')}
          >
            <path d="M 244 70 L 230 62 M 256 70 L 270 62" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 246 86 L 222 86 M 254 86 L 278 86" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            <title>Cranial Nerves: Olfactory (CN I) & Optic (CN II)</title>
          </g>

          {/* Vagus / Lower Cranial */}
          <g
            className={`${styles.diagramElement} ${isSelected('vagus') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('vagus')}
          >
            <path d="M 242 120 Q 220 145 222 220" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
            <path d="M 258 120 Q 280 145 278 220" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
            <title>Cranial Nerves: Vagus Nerve (CN X)</title>
          </g>
        </g>
      )}

      {/* Spinal Nerves & Peripheral Pathways */}
      {spinalVis && (
        <g>
          {/* Brachial Plexus & Upper Extremity Nerves */}
          <g
            className={`${styles.diagramElement} ${isSelected('brachial') || isSelected('radial') || isSelected('median') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('brachial')}
          >
            {/* Left arm */}
            <path d="M 244 165 C 210 168 180 190 150 250 L 125 340 L 115 410" stroke="#60a5fa" strokeWidth="2.5" fill="none" />
            <path d="M 150 250 L 138 340 L 130 405" stroke="#60a5fa" strokeWidth="1.8" fill="none" opacity="0.8" />
            {/* Right arm */}
            <path d="M 256 165 C 290 168 320 190 350 250 L 375 340 L 385 410" stroke="#60a5fa" strokeWidth="2.5" fill="none" />
            <path d="M 350 250 L 362 340 L 370 405" stroke="#60a5fa" strokeWidth="1.8" fill="none" opacity="0.8" />
            <title>Peripheral: Brachial Plexus, Radial, Median, and Ulnar Nerves</title>
          </g>

          {/* Intercostal Thoracic Nerves */}
          <g
            className={`${styles.diagramElement} ${isSelected('intercostal') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('intercostal')}
          >
            {[200, 230, 260, 290, 320, 350].map((y, idx) => (
              <React.Fragment key={y}>
                <path d={`M 244 ${y} Q 210 ${y - 4} 190 ${y + 12}`} stroke="#60a5fa" strokeWidth="1.6" fill="none" opacity="0.75" />
                <path d={`M 256 ${y} Q 290 ${y - 4} 310 ${y + 12}`} stroke="#60a5fa" strokeWidth="1.6" fill="none" opacity="0.75" />
              </React.Fragment>
            ))}
            <title>Peripheral: Intercostal Nerves (T1–T12)</title>
          </g>

          {/* Lumbosacral Plexus & Sciatic / Femoral Nerves */}
          <g
            className={`${styles.diagramElement} ${isSelected('sciatic') || isSelected('femoral') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('sciatic')}
          >
            {/* Left leg (Sciatic + Tibial + Peroneal) */}
            <path d="M 246 430 C 230 460 215 500 210 560 L 205 640 L 200 680" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 246 410 C 238 440 230 480 230 530 L 225 610" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />
            {/* Right leg */}
            <path d="M 254 430 C 270 460 285 500 290 560 L 295 640 L 300 680" stroke="#60a5fa" strokeWidth="3" fill="none" />
            <path d="M 254 410 C 262 440 270 480 270 530 L 275 610" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />
            <title>Peripheral: Lumbosacral Plexus, Sciatic Nerve, Femoral Nerve</title>
          </g>
        </g>
      )}
    </svg>
  );
}

// ─── 2. Brain Atlas Diagram ───────────────────────────────────────────────────

function BrainAtlasDiagram({ isLayerVisible, isSelected, onSelect }: DiagramProps) {
  const cortexVis = isLayerVisible('layer:brain:cortex');
  const cerebVis = isLayerVisible('layer:brain:cerebellum');
  const stemVis = isLayerVisible('layer:brain:brainstem');
  const ventVis = isLayerVisible('layer:brain:ventricles');

  return (
    <svg className={styles.diagramSvg} viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Brainstem (Midbrain, Pons, Medulla) */}
      {stemVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('brainstem') || isSelected('pons') || isSelected('medulla') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('pons')}
        >
          {/* Midbrain & Pons */}
          <path d="M 235 240 C 220 270 215 310 230 350 L 255 350 C 270 310 265 270 250 240 Z" fill="rgba(168,85,247,0.25)" stroke="#a855f7" strokeWidth="2.5" />
          {/* Medulla */}
          <path d="M 230 350 L 235 410 L 250 410 L 255 350 Z" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="2" />
          <title>Brainstem: Midbrain, Pons, and Medulla Oblongata</title>
        </g>
      )}

      {/* Cerebellum */}
      {cerebVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('cerebellum') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('cerebellum')}
        >
          <path
            d="M 255 270 C 310 270 360 300 365 350 C 370 395 330 420 275 410 C 255 405 245 375 250 350 Z"
            fill="rgba(236,72,153,0.22)"
            stroke="#ec4899"
            strokeWidth="2.5"
          />
          {/* Foliated striations */}
          <path d="M 270 310 Q 315 320 345 345" stroke="#ec4899" strokeWidth="1.2" opacity="0.6" />
          <path d="M 265 335 Q 310 350 340 375" stroke="#ec4899" strokeWidth="1.2" opacity="0.6" />
          <path d="M 260 360 Q 295 380 325 395" stroke="#ec4899" strokeWidth="1.2" opacity="0.6" />
          <title>Cerebellum: Motor Coordination and Fine Movement Precision</title>
        </g>
      )}

      {/* Cerebral Cortex Lobes */}
      {cortexVis && (
        <g>
          {/* Frontal Lobe */}
          <g
            className={`${styles.diagramElement} ${isSelected('frontal') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('frontal')}
          >
            <path
              d="M 230 90 C 160 90 100 135 90 200 C 85 240 105 270 145 285 C 185 290 215 270 230 250 C 235 200 232 140 230 90 Z"
              fill="rgba(59,130,246,0.25)"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />
            <title>Frontal Lobe: Executive Function, Planning, Motor Cortex</title>
          </g>

          {/* Parietal Lobe */}
          <g
            className={`${styles.diagramElement} ${isSelected('parietal') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('parietal')}
          >
            <path
              d="M 230 90 C 290 90 345 110 380 150 C 375 195 350 230 310 240 C 275 245 245 245 230 250 C 232 180 230 130 230 90 Z"
              fill="rgba(16,185,129,0.25)"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            <title>Parietal Lobe: Somatosensory Cortex and Spatial Integration</title>
          </g>

          {/* Occipital Lobe */}
          <g
            className={`${styles.diagramElement} ${isSelected('occipital') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('occipital')}
          >
            <path
              d="M 380 150 C 420 190 425 240 405 275 C 385 305 345 300 310 240 C 350 230 375 195 380 150 Z"
              fill="rgba(245,158,11,0.25)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <title>Occipital Lobe: Primary and Secondary Visual Processing</title>
          </g>

          {/* Temporal Lobe */}
          <g
            className={`${styles.diagramElement} ${isSelected('temporal') ? styles.selectedElement : ''}`}
            onClick={() => onSelect('temporal')}
          >
            <path
              d="M 145 285 C 135 320 160 355 205 355 C 240 355 245 310 240 270 C 220 265 180 270 145 285 Z"
              fill="rgba(14,165,233,0.25)"
              stroke="#0ea5e9"
              strokeWidth="2.5"
            />
            <title>Temporal Lobe: Auditory Perception, Language (Wernicke), Memory</title>
          </g>
        </g>
      )}

      {/* Ventricular System */}
      {ventVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('ventricle') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('ventricle')}
        >
          {/* Lateral Ventricle Silhouette */}
          <path
            d="M 210 180 C 240 160 275 170 290 195 C 280 215 250 220 220 210 L 210 240 L 200 220 C 185 210 195 190 210 180 Z"
            fill="rgba(6,182,212,0.4)"
            stroke="#06b6d4"
            strokeWidth="2"
          />
          <title>Ventricular System: Lateral, 3rd, and 4th Ventricles (CSF Circulation)</title>
        </g>
      )}
    </svg>
  );
}

// ─── 3. Neuron Lab Diagram (Cellular Scale) ────────────────────────────────────

interface NeuronDiagramProps extends DiagramProps {
  pulsePos: number;
}

function NeuronLabDiagram({ isLayerVisible, isSelected, onSelect, pulsePos }: NeuronDiagramProps) {
  const somaVis = isLayerVisible('layer:neuron:soma');
  const dendVis = isLayerVisible('layer:neuron:dendrites');
  const axonVis = isLayerVisible('layer:neuron:axon');
  const myelinVis = isLayerVisible('layer:neuron:myelin');
  const synVis = isLayerVisible('layer:neuron:synapse');
  const sigVis = isLayerVisible('layer:neuron:signal');

  // Axon trajectory points for pulse interpolation
  const axonStartX = 250;
  const axonStartY = 240;
  const axonEndY = 530;
  const pulseY = axonStartY + pulsePos * (axonEndY - axonStartY);

  return (
    <svg className={styles.diagramSvg} viewBox="0 0 500 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="somaGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {/* Dendrites & Spines */}
      {dendVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('dendrite') || isSelected('spines') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('dendrite')}
        >
          {/* Apical dendrite branching upwards */}
          <path d="M 250 160 L 250 90 L 210 30 M 250 90 L 290 30" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M 210 60 L 170 20 M 290 60 L 330 20" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          {/* Basal dendrites */}
          <path d="M 215 180 L 150 140 L 110 110 M 150 140 L 120 165" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 285 180 L 350 140 L 390 110 M 350 140 L 380 165" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dendritic spines (dots) */}
          {[
            [210, 50], [290, 50], [195, 38], [305, 38], [140, 130], [360, 130], [245, 110], [255, 110]
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill="#7dd3fc" />
          ))}
          <title>Receptive Processes: Dendrites and Excitatory Dendritic Spines</title>
        </g>
      )}

      {/* Soma (Cell Body) & Nucleus */}
      {somaVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('soma') || isSelected('nucleus') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('soma')}
        >
          <polygon
            points="250,160 285,180 280,225 250,240 220,225 215,180"
            fill="url(#somaGlow)"
            stroke="#0284c7"
            strokeWidth="3"
          />
          {/* Nucleus */}
          <circle cx="250" cy="200" r="14" fill="rgba(2,132,199,0.3)" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="252" cy="198" r="4" fill="#e0f2fe" />
          <title>Soma (Perikaryon) and Nucleus: Metabolic & Genetic Center</title>
        </g>
      )}

      {/* Axon Hillock & Axon Proper */}
      {axonVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('axon') || isSelected('hillock') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('axon')}
        >
          {/* Axon Hillock */}
          <polygon points="244,238 256,238 253,260 247,260" fill="rgba(14,165,233,0.5)" stroke="#0ea5e9" strokeWidth="2" />
          {/* Axon Shaft */}
          <line x1="250" y1="260" x2="250" y2="530" stroke="#0ea5e9" strokeWidth="3" />
          <title>Axon Hillock & Axon Proper: Impulse Generation and Propagation</title>
        </g>
      )}

      {/* Myelin Sheath & Nodes of Ranvier */}
      {myelinVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('myelin') || isSelected('node') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('myelin')}
        >
          {[270, 335, 400, 465].map((y, i) => (
            <React.Fragment key={y}>
              {/* Myelin Internode Capsule */}
              <rect
                x="238"
                y={y}
                width="24"
                height="50"
                rx="8"
                fill="rgba(251,191,36,0.18)"
                stroke="#fbbf24"
                strokeWidth="2"
              />
              {/* Node of Ranvier (gap) */}
              {i < 3 && (
                <circle cx="250" cy={y + 57} r="3" fill="#f59e0b" />
              )}
            </React.Fragment>
          ))}
          <title>Myelin Sheath & Nodes of Ranvier: Enables Saltatory Conduction</title>
        </g>
      )}

      {/* Synaptic Terminals & Boutons */}
      {synVis && (
        <g
          className={`${styles.diagramElement} ${isSelected('synapse') || isSelected('bouton') ? styles.selectedElement : ''}`}
          onClick={() => onSelect('synapse')}
        >
          {/* Axon Telodendria (terminal branches) */}
          <path d="M 250 525 L 210 570 M 250 525 L 250 580 M 250 525 L 290 570" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
          {/* Terminal Boutons */}
          <circle cx="210" cy="572" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <circle cx="250" cy="582" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <circle cx="290" cy="572" r="6" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
          <title>Synaptic Boutons: Presynaptic Neurotransmitter Release Site</title>
        </g>
      )}

      {/* Illustrative Action Potential Signal Pulse */}
      {sigVis && (
        <g>
          <circle
            cx={axonStartX}
            cy={pulseY}
            r="8"
            fill="#38bdf8"
            filter="drop-shadow(0 0 8px #38bdf8)"
          />
          <circle cx={axonStartX} cy={pulseY} r="3" fill="#ffffff" />
          <title>Illustrative Signal Path: Depolarization wave along axon</title>
        </g>
      )}
    </svg>
  );
}

export default NeuroScenePlaceholder;
