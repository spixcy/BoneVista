import type { ResourceItem } from './types';

export const nerveResources: ResourceItem[] = [
  {
    id: 'seemabansal-nerves-model',
    title: '3D Human Full-Body Peripheral & Cranial Nerves',
    category: 'neuro',
    authorsOrOrganization: 'Seema Bansal and contributors',
    description: 'Segmented 3D model of 255 peripheral nerves and cranial pathways mapped into 44 functional clinical groups.',
    sourceUrl: 'https://github.com/SeemaBansal1/3d-human-body-anatomy',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Bansal, S. (2026). 3D Human Body Anatomy: Peripheral & Cranial Nerve Models (Commit 28912432581accd7a1c62129d55f0e9758221d48) [3D Model]. GitHub. https://github.com/SeemaBansal1/3d-human-body-anatomy',
    attributionText: 'Nerves model from SeemaBansal1/3d-human-body-anatomy under CC BY-SA 4.0; derived from BodyParts3D, Z-Anatomy, and CAHID Dundee.',
    versionOrCommit: '28912432581accd7a1c62129d55f0e9758221d48',
    resourceRole: 'Bundled asset',
    boneVistaUsage: 'Bundled locally in public/neuro/nerves.glb and public/neuro/nerves-manifest.json; powers Whole Nervous System mode.',
    relatedModule: 'Neuro & Brain Explorer',
    verificationStatus: 'Verified',
    tags: ['nerves', 'peripheral', 'cranial', 'seemabansal', 'cc-by-sa-4.0']
  },
  {
    id: 'cahid-dundee-cranial-nerves',
    title: 'CAHID Dundee Cranial Nerves & Foramina Models',
    category: 'neuro',
    authorsOrOrganization: 'Centre for Anatomy and Human Identification (CAHID), University of Dundee',
    description: 'Specialized cranial nerve anatomical trajectory and skull base foramina models created for surgical anatomy education.',
    sourceUrl: 'https://www.dundee.ac.uk/cahid',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    citationText: 'Centre for Anatomy and Human Identification (CAHID). (2020). 3D Digital Models of Cranial Nerves and Skull Base Foramina. University of Dundee, Scotland, UK.',
    attributionText: 'Cranial nerve pathways credit CAHID, University of Dundee under CC BY 4.0.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Cranial nerve branching pathways incorporated into the upstream 3d-human-body-anatomy nerve atlas.',
    relatedModule: 'Neuro & Brain Explorer',
    verificationStatus: 'Verified',
    tags: ['dundee', 'cahid', 'cranial-nerves', 'scotland']
  }
];
