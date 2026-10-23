/**
 * BoneVista Neuro & Brain Explorer — Component and Contract Verification Test
 *
 * Verifies that all Neuro Explorer UI components, types, and fixtures
 * adhere to Section 6 of docs/NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md.
 *
 * Owner: Antigravity Flash High
 */

import {
  type NeuroMode,
  type NeuroStructureView,
  type NeuroLayerView,
  type NeuroExplorerViewProps,
  createDemoNeuroUIProps,
  getDemoStructuresForMode,
  DEFAULT_NEURO_LAYERS,
} from './index';

export function runNeuroComponentContractChecks(): { success: boolean; checks: string[] } {
  const checks: string[] = [];

  // Check 1: Structure VM shape and non-index stable IDs across all 3 modes
  const modes: NeuroMode[] = ['nervous-system', 'brain-atlas', 'neuron-lab'];
  for (const mode of modes) {
    const structures = getDemoStructuresForMode(mode);
    if (!structures.length) {
      throw new Error(`Mode ${mode} has empty demo structures`);
    }
    for (const structure of structures) {
      if (!structure.id || !structure.id.startsWith('neuro:')) {
        throw new Error(`Invalid non-namespaced ID: ${structure.id} in mode ${mode}`);
      }
      if (!structure.name || typeof structure.name !== 'string') {
        throw new Error(`Invalid name in structure: ${structure.id}`);
      }
      if (!structure.category || typeof structure.category !== 'string') {
        throw new Error(`Invalid category in structure: ${structure.id}`);
      }
      if (structure.side && !['left', 'right', 'midline', 'unknown'].includes(structure.side)) {
        throw new Error(`Invalid side: ${structure.side} in structure ${structure.id}`);
      }
    }
    checks.push(`Verified ${structures.length} structure VMs with namespaced IDs for mode '${mode}'`);
  }

  // Check 2: Layer Presets completeness
  for (const mode of modes) {
    const layers = DEFAULT_NEURO_LAYERS[mode];
    if (!layers || layers.length === 0) {
      throw new Error(`Missing default layers for mode ${mode}`);
    }
    for (const layer of layers) {
      if (!layer.id || !layer.id.startsWith('layer:')) {
        throw new Error(`Invalid layer ID: ${layer.id}`);
      }
      if (typeof layer.opacity !== 'number' || layer.opacity < 0 || layer.opacity > 1) {
        throw new Error(`Invalid opacity in layer: ${layer.id}`);
      }
    }
    checks.push(`Verified ${layers.length} layers for mode '${mode}'`);
  }

  // Check 3: UI Model interface callback propagation
  const testState = {
    activeMode: 'nervous-system' as NeuroMode,
    searchQuery: '',
    selectedIds: [] as string[],
    toggledLayers: new Set<string>(),
    layerOpacities: new Map<string, number>(),
    isolated: false,
    cleared: false,
    focused: false,
    reset: false,
  };

  const props: NeuroExplorerViewProps = createDemoNeuroUIProps({
    activeMode: testState.activeMode,
    onModeChange: (m) => { testState.activeMode = m; },
    searchQuery: testState.searchQuery,
    onSearchChange: (q) => { testState.searchQuery = q; },
    selectedIds: testState.selectedIds,
    onToggleStructure: (id) => {
      if (testState.selectedIds.includes(id)) {
        testState.selectedIds = testState.selectedIds.filter(x => x !== id);
      } else {
        testState.selectedIds.push(id);
      }
    },
    onToggleLayer: (id) => {
      if (testState.toggledLayers.has(id)) testState.toggledLayers.delete(id);
      else testState.toggledLayers.add(id);
    },
    onLayerOpacityChange: (id, op) => {
      testState.layerOpacities.set(id, op);
    },
    onIsolateSelection: () => { testState.isolated = true; },
    onClearSelection: () => { testState.cleared = true; },
    onFocusSelection: () => { testState.focused = true; },
    onResetView: () => { testState.reset = true; },
  });

  // Verify onModeChange
  props.onModeChange('brain-atlas');
  if (testState.activeMode !== 'brain-atlas') throw new Error('onModeChange callback failed');
  checks.push('Verified onModeChange callback propagation');

  // Verify onSearchChange
  props.onSearchChange('cortex');
  if (testState.searchQuery !== 'cortex') throw new Error('onSearchChange callback failed');
  checks.push('Verified onSearchChange callback propagation');

  // Verify onToggleStructure
  props.onToggleStructure('neuro:system:olfactory_nerve');
  if (!testState.selectedIds.includes('neuro:system:olfactory_nerve')) throw new Error('onToggleStructure callback failed');
  checks.push('Verified onToggleStructure callback propagation');

  // Verify onToggleLayer
  props.onToggleLayer('layer:system:cranial');
  if (!testState.toggledLayers.has('layer:system:cranial')) throw new Error('onToggleLayer callback failed');
  checks.push('Verified onToggleLayer callback propagation');

  // Verify onLayerOpacityChange
  props.onLayerOpacityChange?.('layer:system:cranial', 0.5);
  if (testState.layerOpacities.get('layer:system:cranial') !== 0.5) throw new Error('onLayerOpacityChange callback failed');
  checks.push('Verified onLayerOpacityChange callback propagation');

  // Verify action bar callbacks
  props.onIsolateSelection();
  if (!testState.isolated) throw new Error('onIsolateSelection failed');
  props.onClearSelection();
  if (!testState.cleared) throw new Error('onClearSelection failed');
  props.onFocusSelection();
  if (!testState.focused) throw new Error('onFocusSelection failed');
  props.onResetView();
  if (!testState.reset) throw new Error('onResetView failed');
  checks.push('Verified isolate, clear, focus, and reset callbacks');

  return { success: true, checks };
}
