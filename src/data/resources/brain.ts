import type { ResourceItem } from './types';

export const brainResources: ResourceItem[] = [
  {
    id: 'itayinbarr-brainproject',
    title: 'Brain Project 3D Cerebral Atlas',
    category: 'neuro',
    authorsOrOrganization: 'Itay Inbar and contributors',
    description: 'High-detail 3D human brain model featuring 437 segmented anatomical structures, cortical regions, and deep nuclei.',
    sourceUrl: 'https://github.com/itayinbarr/brainproject',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Inbar, I. (2026). Brain Project: Interactive 3D Human Brain Atlas (Commit 2929e94f521a8ddceab26bc100a98dc06b0da060) [3D Model]. GitHub. https://github.com/itayinbarr/brainproject',
    attributionText: 'Brain model from itayinbarr/brainproject under CC BY-SA 4.0; incorporates Z-Anatomy, BodyParts3D, CIT168, and MRI atlas registrations.',
    versionOrCommit: '2929e94f521a8ddceab26bc100a98dc06b0da060',
    resourceRole: 'Bundled asset',
    boneVistaUsage: 'Bundled locally in public/neuro/brain.glb and public/neuro/brain-manifest.json; powers Brain Atlas mode in Neuro & Brain Explorer.',
    relatedModule: 'Neuro & Brain Explorer',
    verificationStatus: 'Verified',
    tags: ['brain', 'neuroanatomy', 'cerebral', 'cc-by-sa-4.0']
  },
  {
    id: 'cit168-mri-atlas',
    title: 'CIT168 High-Resolution Subcortical Brain Atlas',
    category: 'neuro',
    authorsOrOrganization: 'California Institute of Technology (Caltech)',
    description: 'High-resolution in vivo probabilistic human brain atlas of subcortical nuclei and deep grey-matter structures.',
    sourceUrl: 'https://identifiers.org/neurovault.collection:3176',
    licenseName: 'CC BY 4.0 / CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    citationText: 'Pauli, W. M., Nili, A. N., & Tyszka, J. M. (2018). A high-resolution in vivo magnetic resonance imaging atlas of the human subcortical brain. Scientific Data, 5, 180063. https://doi.org/10.1038/sdata.2018.63',
    attributionText: 'Subcortical nucleus registrations credit the CIT168 atlas by Pauli, Nili, & Tyszka (2018).',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Registration coordinates for deep subcortical structures and amygdala subnuclei in the brain model.',
    relatedModule: 'Neuro & Brain Explorer',
    verificationStatus: 'Verified',
    tags: ['cit168', 'mri', 'subcortical', 'caltech']
  },
  {
    id: 'hcp1065-tractography',
    title: 'HCP1065 Population Tractography Atlas',
    category: 'neuro',
    authorsOrOrganization: 'Fang-Cheng Yeh / Human Connectome Project',
    description: 'Diffusion MRI population template and trajectory mapping for major cerebral white-matter fasciculi and tracts.',
    sourceUrl: 'https://brain.labsolver.org/hcp_template.html',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    citationText: 'Yeh, F.-C., et al. (2022). Population-averaged atlas of the macrostructural human connectome in MNI space. NeuroImage, 178, 57–68. https://doi.org/10.1016/j.neuroimage.2018.05.027',
    attributionText: 'White-matter tract pathways adapted from HCP1065 / Yeh (2022) under CC BY-SA 4.0.',
    resourceRole: 'Adapted or derived asset',
    boneVistaUsage: 'Tractographic spatial guidelines for cerebral pathway visualization in Neuro Explorer.',
    relatedModule: 'Neuro & Brain Explorer',
    verificationStatus: 'Verified',
    tags: ['hcp1065', 'connectome', 'tracts', 'neuroimage']
  }
];
