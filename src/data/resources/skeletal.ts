import type { ResourceItem } from './types';

export const skeletalResources: ResourceItem[] = [
  {
    id: 'z-anatomy-skeletal',
    title: 'Z-Anatomy Libre 3D Atlas',
    category: 'skeletal',
    authorsOrOrganization: 'Gauthier Kervyn and Z-Anatomy Community',
    description: 'Open-source 3D atlas of human anatomy adapted for BoneVista with Draco compression, stable IDs, and clean hierarchies.',
    sourceUrl: 'https://www.z-anatomy.com/',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Kervyn, G., et al. (2023). Z-Anatomy: The open-source 3D atlas of human anatomy. Z-Anatomy. https://www.z-anatomy.com/',
    attributionText: 'Adapted from Z-Anatomy meshes by Gauthier Kervyn and contributors under CC BY-SA 4.0.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Reference skeletal meshes in public/anatomy/skeletal_male.glb and manifest hierarchy in public/anatomy/manifest.json.',
    relatedModule: 'Skeletal Atlas',
    verificationStatus: 'Verified',
    tags: ['anatomy', '3d', 'bones', 'z-anatomy', 'cc-by-sa-4.0']
  },
  {
    id: 'bodyparts3d-skeletal',
    title: 'BodyParts3D Anatomical Dataset',
    category: 'skeletal',
    authorsOrOrganization: 'The Database Center for Life Science (DBCLS), Japan',
    description: 'Upstream anatomical polygon dataset developed by DBCLS forming the geometric base of open anatomical reconstructions.',
    sourceUrl: 'https://dbcls.rois.ac.jp/',
    licenseName: 'CC BY-SA 2.1 Japan',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.1/jp/',
    citationText: 'Mitsuhashi, N., Fujieda, K., Tamura, T., Kawamoto, S., Takagi, T., & Okubo, K. (2009). BodyParts3D: 3D anatomical data for life sciences. Nucleic Acids Research, 37(Database issue), D782–D785. https://doi.org/10.1093/nar/gkn613',
    attributionText: 'BodyParts3D, © The Database Center for Life Science (DBCLS) licensed under CC Attribution-ShareAlike 2.1 Japan.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Primary upstream geometric coordinate baseline inherited via the Z-Anatomy adaptation chain.',
    relatedModule: 'Skeletal Atlas',
    verificationStatus: 'Verified',
    tags: ['dbcls', 'bodyparts3d', 'mesh', 'cc-by-sa-2.1-jp']
  },
  {
    id: 'terminologia-anatomica',
    title: 'Terminologia Anatomica (TA2)',
    category: 'skeletal',
    authorsOrOrganization: 'Federative International Programme for Anatomical Terminology (FIPAT)',
    description: 'International standard for human anatomical terminology providing canonical Latin and English nomenclature.',
    sourceUrl: 'https://fipat.library.dal.ca/ta2/',
    licenseName: 'International Medical Standard (FIPAT)',
    licenseUrl: 'https://fipat.library.dal.ca/',
    citationText: 'FIPAT. (2019). Terminologia Anatomica: International Anatomical Terminology (2nd ed.). Federative International Programme for Anatomical Terminology.',
    attributionText: 'Anatomical nomenclature verified against Terminologia Anatomica 2 (TA2) standards.',
    resourceRole: 'Educational reference',
    boneVistaUsage: 'Canonical Latin anatomical labels and structure naming in the skeletal manifest.',
    relatedModule: 'Skeletal Atlas',
    verificationStatus: 'Verified',
    tags: ['fipat', 'ta2', 'latin', 'nomenclature']
  }
];
