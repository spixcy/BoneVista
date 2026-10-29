export type ResourceCategory = 'skeletal' | 'muscles' | 'neuro' | 'libraries-research';

export type ResourceRole =
  | 'Bundled asset'
  | 'Adapted or derived asset'
  | 'Software dependency'
  | 'Development tool'
  | 'Research reference'
  | 'Educational reference'
  | 'Inspiration only';

export type VerificationStatus = 'Verified' | 'Needs verification';

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  authorsOrOrganization: string;
  description: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  citationText: string;
  attributionText: string;
  versionOrCommit?: string;
  resourceRole: ResourceRole;
  boneVistaUsage: string;
  relatedModule: string;
  verificationStatus: VerificationStatus;
  tags?: string[];
}

export interface ResourceCategoryInfo {
  id: ResourceCategory;
  title: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  resources: ResourceItem[];
}
