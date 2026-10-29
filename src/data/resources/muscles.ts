import type { ResourceItem } from './types';

export const muscleResources: ResourceItem[] = [
  {
    id: 'ecorche-muscle-model',
    title: 'Écorché 3D Muscle Atlas',
    category: 'muscles',
    authorsOrOrganization: 'Charleeh and contributors',
    description: 'Detailed 3D anatomical model of human superficial and deep musculature with FMA identifiers and layered organization.',
    sourceUrl: 'https://github.com/Charleeh/ecorche',
    githubUrl: 'https://github.com/Charleeh/ecorche',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Charleeh. (2026). Écorché: 3D Anatomical Muscle Model (Commit 320805e06aee51e2e6f6b22533eb2a59d43f2d4d) [3D Model]. GitHub. https://github.com/Charleeh/ecorche',
    attributionText: 'Écorché by Charleeh, derived from BodyParts3D / DBCLS (CC BY 4.0) and Z-Anatomy (CC BY-SA 4.0).',
    versionOrCommit: '320805e06aee51e2e6f6b22533eb2a59d43f2d4d',
    resourceRole: 'Bundled asset',
    boneVistaUsage: 'Locally bundled in public/muscle-atlas/ecorche.glb; rendered in Muscle Explorer with superficial/deep toggles.',
    relatedModule: 'Muscle Explorer',
    verificationStatus: 'Verified',
    tags: ['muscles', 'ecorche', 'charleeh', 'fma', 'cc-by-sa-4.0']
  },
  {
    id: 'bodyparts3d-muscles',
    title: 'BodyParts3D Musculoskeletal Dataset',
    category: 'muscles',
    authorsOrOrganization: 'The Database Center for Life Science (DBCLS), Japan',
    description: 'Foundation polygon meshes for muscular and skeletal structures adapted through the Écorché pipeline.',
    sourceUrl: 'https://dbcls.rois.ac.jp/',
    githubUrl: 'https://github.com/dbcls',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    citationText: 'Database Center for Life Science (DBCLS). (2009). BodyParts3D Muscle & Skeletal Geometry. ROIS, Japan. https://dbcls.rois.ac.jp/',
    attributionText: 'Upstream muscle geometry derived from DBCLS BodyParts3D under CC BY 4.0.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Underlying anatomical geometry inherited by the Écorché model.',
    relatedModule: 'Muscle Explorer',
    verificationStatus: 'Verified',
    tags: ['dbcls', 'muscles', 'mesh', 'cc-by-4.0']
  },
  {
    id: 'z-anatomy-muscles',
    title: 'Z-Anatomy Muscle Layer Hierarchy',
    category: 'muscles',
    authorsOrOrganization: 'Gauthier Kervyn and Z-Anatomy contributors',
    description: 'Muscle mesh group layering, anatomical attachments, and terminology classifications derived from Z-Anatomy.',
    sourceUrl: 'https://www.z-anatomy.com/',
    githubUrl: 'https://github.com/Z-Anatomy/Atlas',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Kervyn, G. (2023). Z-Anatomy Atlas: Muscle collections and attachment relationships. Z-Anatomy. https://www.z-anatomy.com/',
    attributionText: 'Muscle classification structure and topology derivations from Z-Anatomy under CC BY-SA 4.0.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Taxonomy of superficial vs. deep muscle layers and structural boundaries.',
    relatedModule: 'Muscle Explorer',
    verificationStatus: 'Verified',
    tags: ['z-anatomy', 'muscles', 'hierarchy', 'cc-by-sa-4.0']
  }
];
