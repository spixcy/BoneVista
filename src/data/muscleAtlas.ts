import * as THREE from 'three';
import type { AnatomyStructure, MuscleAtlasStructure, MuscleLayerPreset } from '../store/appStore';

export const MUSCLE_ATLAS_URL = '/muscle-atlas/ecorche.glb';

export interface MuscleExplorerStructureVM {
  id: string;
  name: string;
  latinName?: string;
  kind: 'bone' | 'muscle';
  layer?: 'superficial' | 'deep';
  side: MuscleAtlasStructure['side'];
  region?: string;
  source: string;
  fmaId?: string;
  meshCount: number;
  visible: boolean;
  selected: boolean;
}

export interface MuscleAtlasModel {
  structures: MuscleAtlasStructure[];
  meshesByStructureId: Map<string, THREE.Mesh[]>;
}

type SourceExtras = {
  name?: string;
  layer?: string;
  side?: string;
  source?: string;
  fma?: string;
  group?: string;
  tissue?: string;
};

function slug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unnamed';
}

function sideOf(value: string | undefined): MuscleAtlasStructure['side'] {
  switch (value?.toLowerCase()) {
    case 'left': return 'left';
    case 'right': return 'right';
    case 'midline': return 'midline';
    case 'bilateral': return 'bilateral';
    default: return 'unknown';
  }
}

function metadata(object: THREE.Object3D): SourceExtras {
  return object.userData as SourceExtras;
}

function entryFor(mesh: THREE.Mesh, extras: SourceExtras): MuscleAtlasStructure | null {
  const name = extras.name?.trim() || mesh.name.trim();
  const sourceLayer = extras.layer?.toLowerCase();
  const kind = sourceLayer === 'skeleton' && extras.tissue === 'bone' ? 'bone'
    : sourceLayer === 'superficial muscles' || sourceLayer === 'deep muscles' ? 'muscle'
      : null;
  if (!name || !kind) return null;

  const layer = kind === 'muscle' ? (sourceLayer === 'superficial muscles' ? 'superficial' : 'deep') : undefined;
  const side = sideOf(extras.side);
  const identity = extras.fma?.trim() ? slug(extras.fma.trim()) : slug(name);
  const id = `${kind}:ecorche:${identity}:${side}`;
  return {
    id,
    name,
    kind,
    ...(layer ? { layer } : {}),
    side,
    source: extras.source?.trim() || 'Écorché',
    ...(extras.fma?.trim() ? { fmaId: extras.fma.trim() } : {}),
    meshNames: [mesh.name || name],
  };
}

/** Groups mesh parts by source FMA ID and side; falls back to a deterministic source name. */
export function normalizeMuscleAtlasModel(scene: THREE.Object3D): MuscleAtlasModel {
  const structures = new Map<string, MuscleAtlasStructure>();
  const meshesByStructureId = new Map<string, THREE.Mesh[]>();

  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const entry = entryFor(object, metadata(object));
    if (!entry) return;
    const existing = structures.get(entry.id);
    if (existing) {
      if (!existing.meshNames.includes(entry.meshNames[0])) existing.meshNames.push(entry.meshNames[0]);
    } else {
      structures.set(entry.id, entry);
    }
    const meshes = meshesByStructureId.get(entry.id) ?? [];
    meshes.push(object);
    meshesByStructureId.set(entry.id, meshes);
    object.userData.muscleStructureId = entry.id;
    object.userData.structureName = entry.name;
  });

  return {
    structures: [...structures.values()].sort((a, b) => a.name.localeCompare(b.name)),
    meshesByStructureId,
  };
}

export function musclePresetIncludes(preset: MuscleLayerPreset, structure: MuscleAtlasStructure): boolean {
  if (preset === 'bones') return structure.kind === 'bone';
  if (preset === 'combined') return true;
  return structure.kind === 'muscle' && structure.layer === preset;
}

export function toMuscleExplorerViewModels(
  preset: MuscleLayerPreset,
  existingBones: readonly AnatomyStructure[],
  muscleStructures: readonly MuscleAtlasStructure[],
  selectedIds: ReadonlySet<string>,
  hiddenIds: ReadonlySet<string>,
): MuscleExplorerStructureVM[] {
  if (preset === 'bones') {
    return existingBones.map((item) => {
      const id = boneVistaUiId(item.organ_id);
      return {
        id,
        name: item.name_en,
        latinName: item.ta2_latin,
        kind: 'bone',
        side: 'unknown',
        region: item.path.join(' / '),
        source: 'BoneVista reference atlas',
        meshCount: 1,
        visible: !hiddenIds.has(item.organ_id),
        selected: selectedIds.has(item.organ_id),
      };
    });
  }
  return muscleStructures.filter((item) => musclePresetIncludes(preset, item)).map((item) => ({
    id: item.id,
    name: item.name,
    kind: item.kind,
    ...(item.layer ? { layer: item.layer } : {}),
    side: item.side,
    source: item.source,
    ...(item.fmaId ? { fmaId: item.fmaId } : {}),
    meshCount: item.meshNames.length,
    visible: !hiddenIds.has(item.id),
    selected: selectedIds.has(item.id),
  }));
}

export function boneVistaUiId(organId: string): string {
  return `bone:bonevista:${organId}`;
}

export function toStoreStructureId(uiId: string): string {
  return uiId.startsWith('bone:bonevista:') ? uiId.slice('bone:bonevista:'.length) : uiId;
}
