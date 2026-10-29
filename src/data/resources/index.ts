import type { ResourceCategory, ResourceCategoryInfo, ResourceItem } from './types';
import { skeletalResources } from './skeletal';
import { muscleResources } from './muscles';
import { brainResources } from './brain';
import { nerveResources } from './nerves';
import { softwareResources } from './software';
import { researchResources } from './research';

export * from './types';
export { skeletalResources } from './skeletal';
export { muscleResources } from './muscles';
export { brainResources } from './brain';
export { nerveResources } from './nerves';
export { softwareResources } from './software';
export { researchResources } from './research';

export const neuroResources: ResourceItem[] = [...brainResources, ...nerveResources];

export const librariesAndResearchResources: ResourceItem[] = [
  ...softwareResources,
  ...researchResources
];

export const allResources: ResourceItem[] = [
  ...skeletalResources,
  ...muscleResources,
  ...neuroResources,
  ...librariesAndResearchResources
];

export const resourceCategories: ResourceCategoryInfo[] = [
  {
    id: 'skeletal',
    title: 'Skeletal Anatomy',
    subtitle: 'Z-Anatomy · BodyParts3D / DBCLS',
    description: 'Reference skeletal models, anatomical labels and related anatomy resources.',
    thumbnailUrl: '/branding/3d-anatomy-card.jpg',
    thumbnailAlt: '3D Skeletal Anatomy reference thumbnail',
    thumbnailScale: 1.15,
    thumbnailPosition: 'center',
    resources: skeletalResources
  },
  {
    id: 'muscles',
    title: 'Muscle Atlas',
    subtitle: 'Écorché · Muscle Anatomy',
    description: 'Superficial and deep muscle anatomy, with attribution to the original model and its upstream sources.',
    thumbnailUrl: '/branding/card-muscles.jpg',
    thumbnailAlt: 'Écorché human muscle atlas illustration',
    thumbnailScale: 1.55,
    thumbnailPosition: 'center',
    resources: muscleResources
  },
  {
    id: 'neuro',
    title: 'Brain & Neuroanatomy',
    subtitle: 'Brain Models · Peripheral Nerves',
    description: 'Brain structures and peripheral nerve models, with links to their individual sources and attribution records.',
    thumbnailUrl: '/branding/card-neuro.jpg',
    thumbnailAlt: 'Brain and peripheral neuroanatomy model illustration',
    thumbnailScale: 1.55,
    thumbnailPosition: 'center',
    resources: neuroResources
  },
  {
    id: 'libraries-research',
    title: 'Libraries & Research',
    subtitle: 'Software · Datasets · Scientific References',
    description: 'Software dependencies, research repositories, datasets and educational references used by BoneVista.',
    thumbnailUrl: '/branding/card-studies.jpg',
    thumbnailAlt: 'Open-source scientific libraries and research illustration',
    thumbnailScale: 1.45,
    thumbnailPosition: 'center',
    resources: librariesAndResearchResources
  }
];

export function getResourcesByCategory(category: ResourceCategory): ResourceItem[] {
  switch (category) {
    case 'skeletal':
      return skeletalResources;
    case 'muscles':
      return muscleResources;
    case 'neuro':
      return neuroResources;
    case 'libraries-research':
      return librariesAndResearchResources;
    default:
      return [];
  }
}

export function searchResources(query: string, categoryFilter?: ResourceCategory | 'all'): ResourceItem[] {
  const cleanQuery = query.trim().toLowerCase();
  let baseList = allResources;

  if (categoryFilter && categoryFilter !== 'all') {
    baseList = getResourcesByCategory(categoryFilter);
  }

  if (!cleanQuery) return baseList;

  return baseList.filter((item) => {
    const haystack = [
      item.title,
      item.authorsOrOrganization,
      item.description,
      item.sourceUrl,
      item.licenseName,
      item.relatedModule,
      item.boneVistaUsage,
      ...(item.tags || [])
    ].join(' ').toLowerCase();

    return haystack.includes(cleanQuery);
  });
}
