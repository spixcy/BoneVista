import type { ResourceItem } from './types';

export const researchResources: ResourceItem[] = [
  {
    id: 'xrayto3d-benchmark',
    title: 'Xrayto3D Benchmark & Reconstruction Methods',
    category: 'libraries-research',
    authorsOrOrganization: 'NAAMII (Nepal Applied Mathematics and Informatics Institute for Research)',
    description: 'Benchmark survey and deep-learning methodology evaluating 3D anatomical surface reconstruction from bi-planar radiographs.',
    sourceUrl: 'https://github.com/naamiinepal/xrayto3D-benchmark',
    licenseName: 'GPL-3.0',
    licenseUrl: 'https://github.com/naamiinepal/xrayto3D-benchmark/blob/main/LICENSE',
    citationText: 'Karki, M., et al. (2023). Xrayto3D: A benchmark for 3D anatomy reconstruction from bi-planar X-rays. NAAMII Research. GitHub. https://github.com/naamiinepal/xrayto3D-benchmark',
    attributionText: 'Research and algorithmic benchmark reference. No benchmark code or neural network checkpoints are bundled in BoneVista.',
    resourceRole: 'Research reference',
    boneVistaUsage: 'Scientific baseline and workflow reference for bi-planar radiograph alignment and research validation.',
    relatedModule: 'X-Ray Workspace & Research',
    verificationStatus: 'Needs verification',
    tags: ['xray', 'reconstruction', 'benchmark', 'research', 'gpl-3.0']
  },
  {
    id: 'visible-human-project',
    title: 'Visible Human Project Cryosection Anatomy',
    category: 'libraries-research',
    authorsOrOrganization: 'U.S. National Library of Medicine (NLM), National Institutes of Health',
    description: 'Pioneering high-resolution anatomic cryosection dataset that established modern standards for digital anatomical modeling.',
    sourceUrl: 'https://www.nlm.nih.gov/research/visible/visible_human.html',
    licenseName: 'NLM Data Agreement',
    licenseUrl: 'https://www.nlm.nih.gov/research/visible/getting_data.html',
    citationText: 'National Library of Medicine. (1995). The Visible Human Project. National Institutes of Health, Bethesda, MD. https://www.nlm.nih.gov/research/visible/visible_human.html',
    attributionText: 'U.S. National Library of Medicine, National Institutes of Health.',
    resourceRole: 'Research reference',
    boneVistaUsage: 'Foundational scientific dataset reference for cross-sectional human anatomy and organ segmentations.',
    relatedModule: 'Anatomy References',
    verificationStatus: 'Verified',
    tags: ['nih', 'nlm', 'cryosection', 'visible-human']
  }
];
