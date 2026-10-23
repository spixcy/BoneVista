/**
 * BoneVista Neuro & Brain Explorer — barrel export
 *
 * Re-exports all public UI components, types, fixtures, and verification
 * utilities for Codex Luna High to import when wiring up the integration.
 *
 * Owner: Antigravity Flash High
 */

export { default as NeuroExplorerPage } from './NeuroExplorerPage';
export { default as NeuroExplorerPanel } from './NeuroExplorerPanel';
export { default as NeuroModeTabs } from './NeuroModeTabs';
export { default as NeuroLayerControls } from './NeuroLayerControls';
export { default as NeuroViewportActions } from './NeuroViewportActions';
export { default as NeuroStructureList } from './NeuroStructureList';
export { default as NeuroStructureDetail } from './NeuroStructureDetail';
export { default as NeuroScenePlaceholder } from './NeuroScenePlaceholder';

export { useNeuroExplorerModel, NEURO_CAMERA_STUBS } from './useNeuroExplorerModel';
export { useNeuroExplorerStore } from './neuroExplorerStore';
export {
  normalizeNervousManifest,
  DEFAULT_NEURO_LAYERS,
  NEURON_LAB_STRUCTURES,
} from './neuroAtlasData';

export {
  DEMO_NERVOUS_SYSTEM_STRUCTURES,
  DEMO_BRAIN_STRUCTURES,
  getDemoStructuresForMode,
  createDemoNeuroUIProps,
} from './fixture';

export { runNeuroComponentContractChecks } from './verifyComponents';

export type {
  NeuroMode,
  NeuroStructureView,
  NeuroLayerView,
  NeuroExplorerViewProps,
} from './types';
export { NEURO_MODE_META } from './types';
